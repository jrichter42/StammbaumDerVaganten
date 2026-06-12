<?php
declare(strict_types=1);

namespace Stammbaum;

use InvalidArgumentException;
use RuntimeException;

final class WebAuthn
{
    private const FLAG_USER_PRESENT = 0x01;
    private const FLAG_USER_VERIFIED = 0x04;
    private const FLAG_ATTESTED_CREDENTIAL_DATA = 0x40;

    private string $rpId;
    private string $origin;
    private string $rpName;

    public function __construct(string $rpId, string $origin, string $rpName)
    {
        $this->rpId = strtolower($rpId);
        $this->origin = rtrim($origin, '/');
        $this->rpName = $rpName;
    }

    /**
     * @param array<string, mixed> $config
     */
    public static function fromConfig(array $config): self
    {
        $authConfig = is_array($config['auth'] ?? null) ? $config['auth'] : [];
        $rpId = (string) ($authConfig['rp_id'] ?? '');
        $origin = (string) ($authConfig['origin'] ?? '');
        if ($rpId === '' || $origin === '') {
            throw new RuntimeException('Explicit auth.rp_id and auth.origin configuration is required.');
        }
        $rpName = (string) ($config['name'] ?? 'Stammbaum der Vaganten');

        return new self($rpId, $origin, $rpName);
    }

    /**
     * @param array<string, mixed> $user
     * @param array<int, array<string, mixed>> $credentials
     * @return array<string, mixed>
     */
    public function registrationOptions(string $challenge, array $user, array $credentials): array
    {
        $excludeCredentials = [];
        foreach ($credentials as $credential) {
            if (is_string($credential['id'] ?? null) && $credential['id'] !== '') {
                $excludeCredentials[] = [
                    'type' => 'public-key',
                    'id' => $credential['id'],
                    'transports' => $credential['transports'] ?? [],
                ];
            }
        }

        return [
            'rp' => ['name' => $this->rpName, 'id' => $this->rpId],
            'user' => [
                'id' => (string) $user['user_handle'],
                'name' => (string) $user['username'],
                'displayName' => (string) ($user['display_name'] ?: $user['username']),
            ],
            'challenge' => $challenge,
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],
            ],
            'timeout' => 120000,
            'excludeCredentials' => $excludeCredentials,
            'authenticatorSelection' => [
                'residentKey' => 'required',
                'requireResidentKey' => true,
                'userVerification' => 'required',
            ],
            'attestation' => 'none',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function authenticationOptions(string $challenge): array
    {
        return [
            'challenge' => $challenge,
            'rpId' => $this->rpId,
            'timeout' => 120000,
            'userVerification' => 'required',
        ];
    }

    /**
     * @param array<string, mixed> $credential
     * @return array<string, mixed>
     */
    public function verifyRegistration(array $credential, string $expectedChallenge): array
    {
        if (($credential['type'] ?? '') !== 'public-key') {
            throw new InvalidArgumentException('Unsupported credential type.');
        }

        $rawId = $this->decodeRequired($credential, 'rawId');
        $response = $this->requireArray($credential, 'response');
        $clientDataJson = $this->decodeRequired($response, 'clientDataJSON');
        $clientData = $this->parseClientData($clientDataJson, 'webauthn.create', $expectedChallenge);
        $attestationObject = Cbor::decode($this->decodeRequired($response, 'attestationObject'));
        if (!is_array($attestationObject) || !is_string($attestationObject['authData'] ?? null)) {
            throw new InvalidArgumentException('Invalid attestation object.');
        }

        $authData = $this->parseAuthenticatorData($attestationObject['authData'], true);
        if (!hash_equals(hash('sha256', $this->rpId, true), $authData['rp_id_hash'])) {
            throw new InvalidArgumentException('Passkey was created for a different site.');
        }

        $this->assertUserPresence($authData['flags']);
        $credentialId = $authData['credential_id'];
        if (!hash_equals($rawId, $credentialId)) {
            throw new InvalidArgumentException('Credential ID mismatch.');
        }

        $publicKey = $this->credentialPublicKeyToPem($authData['credential_public_key']);
        $transports = $response['transports'] ?? [];
        if (!is_array($transports)) {
            $transports = [];
        }

        return [
            'id' => Base64Url::encode($credentialId),
            'public_key_pem' => $publicKey,
            'alg' => -7,
            'sign_count' => $authData['sign_count'],
            'aaguid' => Base64Url::encode($authData['aaguid']),
            'transports' => array_values(array_filter($transports, 'is_string')),
            'created_at' => gmdate('Y-m-d\TH:i:s\Z'),
            'last_used_at' => null,
            'client_origin' => $clientData['origin'],
        ];
    }

    /**
     * @param array<string, mixed> $assertion
     * @param array<string, mixed> $storedCredential
     * @return array<string, mixed>
     */
    public function verifyAuthentication(array $assertion, string $expectedChallenge, array $storedCredential): array
    {
        if (($assertion['type'] ?? '') !== 'public-key') {
            throw new InvalidArgumentException('Unsupported credential type.');
        }

        $rawId = $this->decodeRequired($assertion, 'rawId');
        $credentialId = Base64Url::decode((string) ($storedCredential['id'] ?? ''));
        if (!hash_equals($credentialId, $rawId)) {
            throw new InvalidArgumentException('Passkey mismatch.');
        }

        $response = $this->requireArray($assertion, 'response');
        $clientDataJson = $this->decodeRequired($response, 'clientDataJSON');
        $this->parseClientData($clientDataJson, 'webauthn.get', $expectedChallenge);

        $authenticatorData = $this->decodeRequired($response, 'authenticatorData');
        $authData = $this->parseAuthenticatorData($authenticatorData, false);
        if (!hash_equals(hash('sha256', $this->rpId, true), $authData['rp_id_hash'])) {
            throw new InvalidArgumentException('Passkey was used for a different site.');
        }

        $this->assertUserPresence($authData['flags']);
        $signatureBase = $authenticatorData . hash('sha256', $clientDataJson, true);
        $signature = $this->decodeRequired($response, 'signature');
        $publicKey = (string) ($storedCredential['public_key_pem'] ?? '');

        if (!function_exists('openssl_verify')) {
            throw new RuntimeException('The PHP OpenSSL extension is required for passkey login.');
        }

        $algorithm = defined('OPENSSL_ALGO_SHA256') ? OPENSSL_ALGO_SHA256 : 'sha256';
        $verified = openssl_verify($signatureBase, $signature, $publicKey, $algorithm);
        if ($verified !== 1) {
            throw new InvalidArgumentException('Passkey signature verification failed.');
        }

        $storedSignCount = (int) ($storedCredential['sign_count'] ?? 0);
        $newSignCount = (int) $authData['sign_count'];
        if ($storedSignCount > 0 && $newSignCount > 0 && $newSignCount <= $storedSignCount) {
            throw new InvalidArgumentException('Passkey sign counter did not advance.');
        }

        return [
            'credential_id' => Base64Url::encode($credentialId),
            'sign_count' => $newSignCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function publicContext(): array
    {
        return [
            'rp_id' => $this->rpId,
            'origin' => $this->origin,
            'secure_context_required' => !$this->isLocalOrigin() && strncmp($this->origin, 'https://', 8) !== 0,
            'openssl_available' => function_exists('openssl_verify'),
        ];
    }

    /**
     * @param array<string, mixed> $source
     */
    private function decodeRequired(array $source, string $key): string
    {
        if (!is_string($source[$key] ?? null)) {
            throw new InvalidArgumentException('Missing WebAuthn field.');
        }

        return Base64Url::decode($source[$key]);
    }

    /**
     * @param array<string, mixed> $source
     * @return array<string, mixed>
     */
    private function requireArray(array $source, string $key): array
    {
        if (!is_array($source[$key] ?? null)) {
            throw new InvalidArgumentException('Missing WebAuthn response.');
        }

        return $source[$key];
    }

    /**
     * @return array<string, mixed>
     */
    private function parseClientData(string $clientDataJson, string $expectedType, string $expectedChallenge): array
    {
        try {
            $clientData = json_decode($clientDataJson, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new InvalidArgumentException('Invalid WebAuthn client data.', 0, $exception);
        }

        if (!is_array($clientData)
            || ($clientData['type'] ?? '') !== $expectedType
            || !is_string($clientData['challenge'] ?? null)
            || !hash_equals($expectedChallenge, $clientData['challenge'])
            || ($clientData['origin'] ?? '') !== $this->origin) {
            throw new InvalidArgumentException('WebAuthn client data did not match this request.');
        }

        if (($clientData['crossOrigin'] ?? false) === true) {
            throw new InvalidArgumentException('Cross-origin WebAuthn responses are not accepted.');
        }

        return $clientData;
    }

    /**
     * @return array<string, mixed>
     */
    private function parseAuthenticatorData(string $authData, bool $expectAttestedCredentialData): array
    {
        if (strlen($authData) < 37) {
            throw new InvalidArgumentException('Authenticator data is too short.');
        }

        $offset = 0;
        $rpIdHash = substr($authData, $offset, 32);
        $offset += 32;
        $flags = ord($authData[$offset]);
        $offset++;
        $signCount = unpack('N', substr($authData, $offset, 4))[1];
        $offset += 4;

        $result = [
            'rp_id_hash' => $rpIdHash,
            'flags' => $flags,
            'sign_count' => $signCount,
        ];

        if (!$expectAttestedCredentialData) {
            return $result;
        }

        if (($flags & self::FLAG_ATTESTED_CREDENTIAL_DATA) === 0) {
            throw new InvalidArgumentException('Attested credential data is missing.');
        }

        if (strlen($authData) < $offset + 18) {
            throw new InvalidArgumentException('Attested credential data is incomplete.');
        }

        $aaguid = substr($authData, $offset, 16);
        $offset += 16;
        $credentialIdLength = unpack('n', substr($authData, $offset, 2))[1];
        $offset += 2;

        if (strlen($authData) < $offset + $credentialIdLength) {
            throw new InvalidArgumentException('Credential ID is incomplete.');
        }

        $credentialId = substr($authData, $offset, $credentialIdLength);
        $offset += $credentialIdLength;
        $credentialPublicKey = substr($authData, $offset);
        if ($credentialPublicKey === '') {
            throw new InvalidArgumentException('Credential public key is missing.');
        }

        $result['aaguid'] = $aaguid;
        $result['credential_id'] = $credentialId;
        $result['credential_public_key'] = $credentialPublicKey;

        return $result;
    }

    private function assertUserPresence(int $flags): void
    {
        if (($flags & self::FLAG_USER_PRESENT) === 0) {
            throw new InvalidArgumentException('User presence was not verified.');
        }

        if (($flags & self::FLAG_USER_VERIFIED) === 0) {
            throw new InvalidArgumentException('User verification is required.');
        }
    }

    private function credentialPublicKeyToPem(string $credentialPublicKey): string
    {
        $key = Cbor::decodeFirst($credentialPublicKey);
        if (!is_array($key)
            || ($key[1] ?? null) !== 2
            || ($key[3] ?? null) !== -7
            || ($key[-1] ?? null) !== 1
            || !is_string($key[-2] ?? null)
            || !is_string($key[-3] ?? null)) {
            throw new InvalidArgumentException('Only ES256 passkeys are supported.');
        }

        $x = $key[-2];
        $y = $key[-3];
        if (strlen($x) !== 32 || strlen($y) !== 32) {
            throw new InvalidArgumentException('Invalid ES256 public key.');
        }

        $ecPublicKeyOid = "\x06\x07\x2a\x86\x48\xce\x3d\x02\x01";
        $prime256v1Oid = "\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07";
        $algorithm = $this->derSequence($ecPublicKeyOid . $prime256v1Oid);
        $point = "\x04" . $x . $y;
        $subjectPublicKey = "\x03" . $this->derLength(strlen($point) + 1) . "\x00" . $point;
        $spki = $this->derSequence($algorithm . $subjectPublicKey);

        return "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split(base64_encode($spki), 64, "\n")
            . "-----END PUBLIC KEY-----\n";
    }

    private function derSequence(string $body): string
    {
        return "\x30" . $this->derLength(strlen($body)) . $body;
    }

    private function derLength(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }

        $bytes = '';
        while ($length > 0) {
            $bytes = chr($length & 0xff) . $bytes;
            $length >>= 8;
        }

        return chr(0x80 | strlen($bytes)) . $bytes;
    }

    private function isLocalOrigin(): bool
    {
        $host = parse_url($this->origin, PHP_URL_HOST);
        return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    }
}
