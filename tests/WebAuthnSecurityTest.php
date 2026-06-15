<?php
declare(strict_types=1);

/**
 * WebAuthn security test vectors.
 *
 * Covers: valid registration/authentication, malformed CBOR, origin/RP ID
 * mismatch, missing UP/UV flags, unsupported algorithms, invalid signatures,
 * sign-counter regression, cross-origin client data.
 *
 * Usage: php tests/WebAuthnSecurityTest.php
 */

putenv('SERVER_NAME=stammbaumdervaganten.de');

// Minimal autoloader (no config, no auth, no storage needed)
spl_autoload_register(function (string $class): void {
    if (strncmp($class, 'Stammbaum\\', 10) !== 0) {
        return;
    }
    $path = __DIR__ . '/../web/app/' . substr($class, 10) . '.php';
    if (is_file($path)) {
        require_once $path;
    }
});

use Stammbaum\Base64Url;
use Stammbaum\Cbor;
use Stammbaum\WebAuthn;

$pass = 0;
$fail = 0;
$skip = 0;
$errors = [];

function test(string $label, callable $fn): void
{
    global $pass, $fail, $errors;
    try {
        $fn();
        $pass++;
        echo "  PASS: {$label}\n";
    } catch (\Throwable $e) {
        $fail++;
        $errors[] = "FAIL: {$label} — " . $e->getMessage();
        echo "  FAIL: {$label}\n";
    }
}

function test_throws(
    string $label,
    callable $fn,
    string $expectedClass = \InvalidArgumentException::class
): void
{
    global $pass, $fail, $errors;
    try {
        $fn();
        $fail++;
        $errors[] = "FAIL: {$label} — expected exception, none thrown";
        echo "  FAIL: {$label} (no exception)\n";
    } catch (\Throwable $e) {
        if (!$e instanceof $expectedClass) {
            $fail++;
            $actualClass = get_class($e);
            $errors[] = "FAIL: {$label} - expected {$expectedClass}, got {$actualClass}: " . $e->getMessage();
            echo "  FAIL: {$label} (unexpected {$actualClass})\n";
            return;
        }
        $pass++;
        echo "  PASS: {$label} (" . (new \ReflectionClass($e))->getShortName() . ")\n";
    }
}

function skip(string $label, string $reason): void
{
    global $skip;
    $skip++;
    echo "  SKIP: {$label} ({$reason})\n";
}

// === Helpers ===

function webauthn(): WebAuthn
{
    return new WebAuthn('stammbaumdervaganten.de', 'https://stammbaumdervaganten.de', 'Test');
}

function rpIdHash(): string
{
    return hash('sha256', 'stammbaumdervaganten.de', true);
}

function buildAuthData(string $rpIdHash, int $flags, int $signCount, ?array $attested = null): string
{
    $data = $rpIdHash;
    $data .= chr($flags);
    $data .= pack('N', $signCount);
    if ($attested !== null) {
        $data .= $attested['aaguid'];
        $data .= pack('n', strlen($attested['credential_id']));
        $data .= $attested['credential_id'];
        $data .= $attested['credential_public_key'];
    }
    return $data;
}

function buildCoseKey(int $alg, string $x, string $y): string
{
    $map = [];
    $map[1] = 2;
    $map[3] = $alg;
    $map[-1] = 1;
    $map[-2] = $x;
    $map[-3] = $y;
    return cborEncodeMap($map);
}

function cborEncodeMap(array $map): string
{
    ksort($map);
    $items = '';
    foreach ($map as $key => $value) {
        $items .= cborEncodeValue($key) . cborEncodeValue($value);
    }
    return chr(0xa0 | count($map)) . $items;
}

function cborEncodeValue($value): string
{
    if (is_int($value)) {
        if ($value >= 0) {
            if ($value < 24) {
                return chr($value);
            }
            if ($value < 256) {
                return chr(24) . chr($value);
            }
            if ($value < 65536) {
                return chr(25) . pack('n', $value);
            }
            return chr(26) . pack('N', $value);
        }
        $pos = -1 - $value;
        if ($pos < 24) {
            return chr(0x20 | $pos);
        }
        if ($pos < 256) {
            return chr(0x20 | 24) . chr($pos);
        }
        return chr(0x20 | 25) . pack('n', $pos);
    }
    if (is_string($value)) {
        $len = strlen($value);
        if ($len < 24) {
            return chr(0x40 | $len) . $value;
        }
        if ($len < 256) {
            return chr(0x40 | 24) . chr($len) . $value;
        }
        if ($len < 65536) {
            return chr(0x40 | 25) . pack('n', $len) . $value;
        }
        return chr(0x40 | 26) . pack('N', $len) . $value;
    }
    throw new \RuntimeException('Unsupported CBOR value type');
}

function clientDataJson(string $type, string $challenge, string $origin = 'https://stammbaumdervaganten.de', bool $crossOrigin = false): string
{
    return json_encode([
        'type' => $type,
        'challenge' => $challenge,
        'origin' => $origin,
        'crossOrigin' => $crossOrigin,
    ], JSON_THROW_ON_ERROR);
}

function cborAttestationObject(string $authData, string $fmt = 'none'): string
{
    $map = chr(0xa3);
    $map .= cborEncodeValue('fmt') . cborEncodeValue($fmt);
    $map .= cborEncodeValue('authData') . cborEncodeValue($authData);
    $map .= cborEncodeValue('attStmt') . cborEncodeMap([]);
    return $map;
}

echo "=== WebAuthn Security Tests ===\n\n";

// 1. Base64Url encode/decode round trip
test('Base64Url round trip', function (): void {
    $original = random_bytes(32);
    $encoded = Base64Url::encode($original);
    $decoded = Base64Url::decode($encoded);
    if ($decoded !== $original) {
        throw new \RuntimeException('Round trip failed');
    }
    if (preg_match('/^[A-Za-z0-9_-]+$/', $encoded) !== 1) {
        throw new \RuntimeException('Base64url encoding contains non-url-safe chars');
    }
});

// 2. Base64Url rejects invalid chars
test_throws('Base64Url rejects +', function (): void {
    Base64Url::decode('abc+def');
});

// 3. Base64Url rejects /
test_throws('Base64Url rejects /', function (): void {
    Base64Url::decode('abc/def');
});

// 4. CBOR decode simple values
test('CBOR decode integer 0', function (): void {
    if (Cbor::decode("\x00") !== 0) { throw new \RuntimeException('Expected 0'); }
});
test('CBOR decode integer 1', function (): void {
    if (Cbor::decode("\x01") !== 1) { throw new \RuntimeException('Expected 1'); }
});
test('CBOR decode integer 23', function (): void {
    if (Cbor::decode("\x17") !== 23) { throw new \RuntimeException('Expected 23'); }
});
test('CBOR decode integer 24', function (): void {
    if (Cbor::decode("\x18\x18") !== 24) { throw new \RuntimeException('Expected 24'); }
});
test('CBOR decode integer 255', function (): void {
    if (Cbor::decode("\x18\xff") !== 255) { throw new \RuntimeException('Expected 255'); }
});
test('CBOR decode negative -1', function (): void {
    if (Cbor::decode("\x20") !== -1) { throw new \RuntimeException('Expected -1'); }
});
test('CBOR decode true', function (): void {
    if (Cbor::decode("\xf5") !== true) { throw new \RuntimeException('Expected true'); }
});
test('CBOR decode false', function (): void {
    if (Cbor::decode("\xf4") !== false) { throw new \RuntimeException('Expected false'); }
});
test('CBOR decode null', function (): void {
    if (Cbor::decode("\xf6") !== null) { throw new \RuntimeException('Expected null'); }
});
test('CBOR decode text string', function (): void {
    if (Cbor::decode("\x65Hello") !== 'Hello') { throw new \RuntimeException('Expected Hello'); }
});
test('CBOR decode byte string', function (): void {
    if (Cbor::decode("\x45Hello") !== 'Hello') { throw new \RuntimeException('Expected Hello'); }
});
test('CBOR decode array', function (): void {
    $result = Cbor::decode("\x83\x01\x02\x03");
    if ($result !== [1, 2, 3]) { throw new \RuntimeException('Expected [1,2,3]'); }
});
test('CBOR decode map', function (): void {
    $result = Cbor::decode("\xa2\x01\x02\x03\x04");
    if ($result !== [1 => 2, 3 => 4]) { throw new \RuntimeException('Expected map'); }
});
test('CBOR decodeFirst partial', function (): void {
    $result = Cbor::decodeFirst("\x01\x02");
    if ($result !== 1) { throw new \RuntimeException('Expected 1'); }
});

// 5. CBOR rejects invalid / truncated data
test_throws('CBOR rejects indefinite length', function (): void {
    Cbor::decode("\x1f");
}, \RuntimeException::class);
test_throws('CBOR rejects truncated', function (): void {
    Cbor::decode("\x18");
}, \RuntimeException::class);
test_throws('CBOR rejects trailing data', function (): void {
    Cbor::decode("\x01\x02");
}, \RuntimeException::class);
test_throws('CBOR rejects unsupported float', function (): void {
    Cbor::decode("\xf9\x00\x00");
}, \RuntimeException::class);

// 6. OpenSSL availability check
$opensslAvailable = function_exists('openssl_verify');
if (!$opensslAvailable) {
    skip('Crypto tests', 'OpenSSL unavailable');
}

// Known P-256 test key pair (static, deterministic)
$staticX = "\x5e\x0b\x7a\x3c\x1c\xf3\xd7\xce\xf0\xc7\x78\xe8\x7c\xde\xd5\x05\x1e\xe9\xcb\x5b\xb5\x3e\xa5\xaa\xb7\xc9\xd0\x2e\x8d\xa2\x20\xd9";
$staticY = "\xcd\x8f\xe7\xb5\x8b\x3b\xdf\x62\x86\xca\x16\x7a\x0d\x4e\xbd\xf4\xc2\xd9\xf1\x98\x45\x7f\x94\x4f\xb9\x7f\xa0\x1d\x36\x49\x57\x40";

// Generate a real key for signing
$keyPair = null;
if ($opensslAvailable) {
    $keyResource = openssl_pkey_new([
        'private_key_type' => OPENSSL_KEYTYPE_EC,
        'curve_name' => 'prime256v1',
    ]);
    if ($keyResource !== false) {
        $pubDetails = openssl_pkey_get_details($keyResource);
        if ($pubDetails !== false && isset($pubDetails['ec']['x'], $pubDetails['ec']['y'])) {
            $keyPair = [
                'key' => $keyResource,
                'x' => $pubDetails['ec']['x'],
                'y' => $pubDetails['ec']['y'],
            ];
        }
    }
}

if ($keyPair === null) {
    skip('Signature-dependent tests', 'EC P-256 key generation unavailable');
}

// Store credential for auth tests
$storedCredential = null;
$credentialId = random_bytes(16);

// 7. CBOR COSE key decode
test('CBOR decode COSE ES256 key', function () use ($staticX, $staticY): void {
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $decoded = Cbor::decodeFirst($cose);
    if (!is_array($decoded)) { throw new \RuntimeException('COSE key not decoded'); }
    if (($decoded[3] ?? null) !== -7) { throw new \RuntimeException('Wrong algorithm'); }
    if (($decoded[-2] ?? null) !== $staticX) { throw new \RuntimeException('X coord mismatch'); }
    if (($decoded[-3] ?? null) !== $staticY) { throw new \RuntimeException('Y coord mismatch'); }
});

if ($opensslAvailable && $keyPair !== null) {
    $challengeB64 = Base64Url::encode(random_bytes(32));

    // 8. Full valid registration
    test('Valid registration verification', function () use ($keyPair, $credentialId, $challengeB64): void {
        $cose = buildCoseKey(-7, $keyPair['x'], $keyPair['y']);
        $authData = buildAuthData(rpIdHash(), 0x45, 1, [
            'aaguid' => str_repeat("\x00", 16),
            'credential_id' => $credentialId,
            'credential_public_key' => $cose,
        ]);

        $attObj = cborAttestationObject($authData);
        $clientData = clientDataJson('webauthn.create', $challengeB64);

        $credential = [
            'id' => Base64Url::encode($credentialId),
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'attestationObject' => Base64Url::encode($attObj),
                'transports' => ['internal'],
            ],
        ];

        $result = webauthn()->verifyRegistration($credential, $challengeB64);
        if (!isset($result['id'])) { throw new \RuntimeException('Missing credential ID'); }
        if (!isset($result['public_key_pem'])) { throw new \RuntimeException('Missing public key'); }
        if ($result['alg'] !== -7) { throw new \RuntimeException('Wrong algorithm'); }
        if ($result['sign_count'] !== 1) { throw new \RuntimeException('Wrong sign count'); }
        if (!str_starts_with($result['public_key_pem'], '-----BEGIN PUBLIC KEY-----')) {
            throw new \RuntimeException('Invalid PEM format');
        }

        // Store for auth tests
        $GLOBALS['storedCredential'] = [
            'id' => $result['id'],
            'public_key_pem' => $result['public_key_pem'],
            'sign_count' => 5,
        ];
    });

    // 9. Valid authentication
    test('Valid authentication verification', function () use ($keyPair, $credentialId): void {
        $assertionChallenge = Base64Url::encode(random_bytes(32));
        $clientData = clientDataJson('webauthn.get', $assertionChallenge);
        $authData = buildAuthData(rpIdHash(), 0x01, 6);
        $sigBase = $authData . hash('sha256', $clientData, true);

        $signature = '';
        openssl_sign($sigBase, $signature, $keyPair['key'], OPENSSL_ALGO_SHA256);

        $assertion = [
            'id' => $GLOBALS['storedCredential']['id'],
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'authenticatorData' => Base64Url::encode($authData),
                'signature' => Base64Url::encode($signature),
            ],
        ];

        $result = webauthn()->verifyAuthentication($assertion, $assertionChallenge, $GLOBALS['storedCredential']);
        if (!isset($result['credential_id'])) { throw new \RuntimeException('Missing credential_id'); }
        if ($result['sign_count'] !== 6) { throw new \RuntimeException('Sign count must advance to 6'); }
    });

    // 10. Auth rejects wrong credential ID
    test_throws('Auth rejects wrong credential ID', function () use ($keyPair, $credentialId): void {
        $assertionChallenge = Base64Url::encode(random_bytes(32));
        $clientData = clientDataJson('webauthn.get', $assertionChallenge);
        $authData = buildAuthData(rpIdHash(), 0x01, 1);
        $sigBase = $authData . hash('sha256', $clientData, true);
        $signature = '';
        openssl_sign($sigBase, $signature, $keyPair['key'], OPENSSL_ALGO_SHA256);

        $assertion = [
            'id' => Base64Url::encode(random_bytes(16)),
            'rawId' => Base64Url::encode(random_bytes(16)),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'authenticatorData' => Base64Url::encode($authData),
                'signature' => Base64Url::encode($signature),
            ],
        ];
        webauthn()->verifyAuthentication($assertion, $assertionChallenge, $GLOBALS['storedCredential']);
    });

    // 11. Auth rejects invalid signature
    test_throws('Auth rejects invalid signature', function () use ($credentialId): void {
        $assertionChallenge = Base64Url::encode(random_bytes(32));
        $clientData = clientDataJson('webauthn.get', $assertionChallenge);
        $authData = buildAuthData(rpIdHash(), 0x01, 1);
        $sigBase = $authData . hash('sha256', $clientData, true);
        $otherKey = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1']);
        $signature = '';
        if ($otherKey !== false) {
            openssl_sign($sigBase, $signature, $otherKey, OPENSSL_ALGO_SHA256);
        }

        $assertion = [
            'id' => $GLOBALS['storedCredential']['id'],
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'authenticatorData' => Base64Url::encode($authData),
                'signature' => Base64Url::encode($signature ?: str_repeat("\x00", 64)),
            ],
        ];
        webauthn()->verifyAuthentication($assertion, $assertionChallenge, $GLOBALS['storedCredential']);
    });

    // 12. Registration rejects wrong origin
    test_throws('Registration rejects wrong origin', function () use ($keyPair, $credentialId, $challengeB64): void {
        $cose = buildCoseKey(-7, $keyPair['x'], $keyPair['y']);
        $authData = buildAuthData(rpIdHash(), 0x45, 1, [
            'aaguid' => str_repeat("\x00", 16),
            'credential_id' => $credentialId,
            'credential_public_key' => $cose,
        ]);
        $attObj = cborAttestationObject($authData);
        $clientData = clientDataJson('webauthn.create', $challengeB64, 'https://evil.com');

        webauthn()->verifyRegistration([
            'id' => Base64Url::encode($credentialId),
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'attestationObject' => Base64Url::encode($attObj),
            ],
        ], $challengeB64);
    });

    // 13. Registration rejects cross-origin
    test_throws('Registration rejects cross-origin', function () use ($keyPair, $credentialId, $challengeB64): void {
        $cose = buildCoseKey(-7, $keyPair['x'], $keyPair['y']);
        $authData = buildAuthData(rpIdHash(), 0x45, 1, [
            'aaguid' => str_repeat("\x00", 16),
            'credential_id' => $credentialId,
            'credential_public_key' => $cose,
        ]);
        $attObj = cborAttestationObject($authData);
        $clientData = clientDataJson('webauthn.create', $challengeB64, 'https://stammbaumdervaganten.de', true);

        webauthn()->verifyRegistration([
            'id' => Base64Url::encode($credentialId),
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'attestationObject' => Base64Url::encode($attObj),
            ],
        ], $challengeB64);
    });

    // 14. Auth rejects cross-origin
    test_throws('Auth rejects cross-origin client data', function () use ($credentialId): void {
        $assertionChallenge = Base64Url::encode(random_bytes(32));
        $clientData = clientDataJson('webauthn.get', $assertionChallenge, 'https://evil.com');
        $authData = buildAuthData(rpIdHash(), 0x01, 1);

        webauthn()->verifyAuthentication([
            'id' => $GLOBALS['storedCredential']['id'],
            'rawId' => Base64Url::encode($credentialId),
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => Base64Url::encode($clientData),
                'authenticatorData' => Base64Url::encode($authData),
                'signature' => Base64Url::encode(str_repeat("\x00", 64)),
            ],
        ], $assertionChallenge, $GLOBALS['storedCredential']);
    });
} else {
    // Skip already reported above with exact reason.
}

// 15. Registration rejects wrong credential type
test_throws('Registration rejects wrong credential type', function (): void {
    webauthn()->verifyRegistration(
        ['id' => 'test', 'rawId' => Base64Url::encode('test'), 'type' => 'not-public-key', 'response' => ['clientDataJSON' => Base64Url::encode('{}'), 'attestationObject' => Base64Url::encode("\xa0")]],
        'challenge'
    );
});

// 16. Registration rejects missing rawId
test_throws('Registration rejects missing rawId', function (): void {
    webauthn()->verifyRegistration(
        ['type' => 'public-key', 'response' => ['clientDataJSON' => Base64Url::encode('{}'), 'attestationObject' => Base64Url::encode("\xa0")]],
        'challenge'
    );
});

// 17. Registration rejects missing clientData
test_throws('Registration rejects missing clientData', function (): void {
    webauthn()->verifyRegistration(
        ['id' => 'test', 'rawId' => Base64Url::encode('test'), 'type' => 'public-key', 'response' => ['attestationObject' => Base64Url::encode("\xa0")]],
        'challenge'
    );
});

// 18. Registration rejects wrong client data type
test_throws('Registration rejects wrong client data type', function () use ($credentialId, $staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.get', $challenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $authData = buildAuthData(rpIdHash(), 0x45, 1, [
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 19. Registration rejects wrong challenge
test_throws('Registration rejects wrong challenge', function () use ($credentialId, $staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $wrongChallenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $wrongChallenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $authData = buildAuthData(rpIdHash(), 0x45, 1, [
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 20. Registration rejects wrong RP ID hash
test_throws('Registration rejects wrong RP ID hash', function () use ($credentialId, $staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $wrongRpIdHash = hash('sha256', 'evil.com', true);
    $authData = buildAuthData($wrongRpIdHash, 0x45, 1, [
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 21. Registration rejects missing UP flag
test_throws('Registration rejects missing UP flag', function () use ($credentialId, $staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $authData = buildAuthData(rpIdHash(), 0x40, 1, [ // AT only, no UP
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 22. Registration rejects missing UV flag (has UP but not UV)
test_throws('Registration rejects missing UV flag', function () use ($credentialId, $staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $authData = buildAuthData(rpIdHash(), 0x41, 1, [ // UP + AT, no UV
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 23. Registration rejects unsupported algorithm
test_throws('Registration rejects unsupported algorithm', function () use ($credentialId): void {
    $x = str_repeat("\x00", 32);
    $y = str_repeat("\x00", 32);
    $badKey = buildCoseKey(-257, $x, $y); // RS256

    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $authData = buildAuthData(rpIdHash(), 0x45, 1, [
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $credentialId,
        'credential_public_key' => $badKey,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 24. Auth rejects missing UP flag
test_throws('Auth rejects missing UP flag', function () use ($credentialId): void {
    $assertionChallenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.get', $assertionChallenge);
    $authData = buildAuthData(rpIdHash(), 0x00, 1);

    webauthn()->verifyAuthentication([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'authenticatorData' => Base64Url::encode($authData),
            'signature' => Base64Url::encode(str_repeat("\x00", 64)),
        ],
    ], $assertionChallenge, ['id' => Base64Url::encode($credentialId), 'public_key_pem' => "-----BEGIN PUBLIC KEY-----\n", 'sign_count' => 0]);
});

// 25. Registration rejects short authenticator data
test_throws('Registration rejects short authenticator data', function (): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $shortAuth = str_repeat("\x00", 36);

    webauthn()->verifyRegistration([
        'id' => 'test',
        'rawId' => Base64Url::encode('test'),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($shortAuth)),
        ],
    ], $challenge);
});

// 26. Registration rejects missing AT flag in auth data
test_throws('Registration rejects missing AT flag in auth data', function () use ($credentialId): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $authData = buildAuthData(rpIdHash(), 0x05, 1); // UP + UV, no AT

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 27. Registration rejects credential ID mismatch
test_throws('Registration rejects credential ID mismatch', function () use ($staticX, $staticY): void {
    $challenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.create', $challenge);
    $cose = buildCoseKey(-7, $staticX, $staticY);
    $regCredId = random_bytes(16);
    $authCredId = random_bytes(16);
    $authData = buildAuthData(rpIdHash(), 0x45, 1, [
        'aaguid' => str_repeat("\x00", 16),
        'credential_id' => $authCredId,
        'credential_public_key' => $cose,
    ]);

    webauthn()->verifyRegistration([
        'id' => Base64Url::encode($regCredId),
        'rawId' => Base64Url::encode($regCredId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'attestationObject' => Base64Url::encode(cborAttestationObject($authData)),
        ],
    ], $challenge);
});

// 28. Auth rejects wrong RP ID hash
test_throws('Auth rejects wrong RP ID hash', function () use ($credentialId): void {
    $assertionChallenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.get', $assertionChallenge);
    $authData = buildAuthData(hash('sha256', 'evil.com', true), 0x01, 1);

    webauthn()->verifyAuthentication([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'authenticatorData' => Base64Url::encode($authData),
            'signature' => Base64Url::encode(str_repeat("\x00", 64)),
        ],
    ], $assertionChallenge, ['id' => Base64Url::encode($credentialId), 'public_key_pem' => "-----BEGIN PUBLIC KEY-----\n", 'sign_count' => 0]);
});

// 29. Sign counter regression test (signature-independent)
test_throws('Auth rejects sign counter regression', function () use ($credentialId): void {
    $assertionChallenge = Base64Url::encode(random_bytes(32));
    $clientData = clientDataJson('webauthn.get', $assertionChallenge);
    $authData = buildAuthData(rpIdHash(), 0x01, 50); // lower sign count

    webauthn()->verifyAuthentication([
        'id' => Base64Url::encode($credentialId),
        'rawId' => Base64Url::encode($credentialId),
        'type' => 'public-key',
        'response' => [
            'clientDataJSON' => Base64Url::encode($clientData),
            'authenticatorData' => Base64Url::encode($authData),
            'signature' => Base64Url::encode(str_repeat("\x00", 64)),
        ],
    ], $assertionChallenge, ['id' => Base64Url::encode($credentialId), 'public_key_pem' => "-----BEGIN PUBLIC KEY-----\n", 'sign_count' => 100]);
});

echo "\n=== Results ===\n";
echo "Passed: {$pass}\n";
echo "Failed: {$fail}\n";
echo "Skipped: {$skip}\n";

if ($errors !== []) {
    echo "\nFailures:\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
    exit(1);
}

echo "All tests passed.\n";
