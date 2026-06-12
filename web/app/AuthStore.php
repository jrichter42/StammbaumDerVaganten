<?php
declare(strict_types=1);

namespace Stammbaum;

use InvalidArgumentException;
use RuntimeException;

final class AuthStore
{
    public const PERMISSIONS = ['read', 'write', 'sensitive', 'manage_users'];

    private string $authPath;
    private string $usersPath;
    private string $tokensPath;
    private string $challengesPath;
    private string $loginLinksPath;
    private string $auditPath;
    private string $bootstrapPath;
    private string $initialAdminUsername = 'admin';
    private ?string $baseUrl = null;
    private int $loginLinkTtlSeconds = 600;
    private bool $emailLoginAvailable = false;

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(string $basePath, array $config = [])
    {
        $this->authPath = rtrim($basePath, '/\\') . '/var/auth';
        $this->usersPath = $this->authPath . '/users.json';
        $this->tokensPath = $this->authPath . '/setup_tokens.json';
        $this->challengesPath = $this->authPath . '/challenges.json';
        $this->loginLinksPath = $this->authPath . '/login_links.json';
        $this->auditPath = $this->authPath . '/audit.jsonl';
        $this->bootstrapPath = rtrim($basePath, '/\\') . '/bootstrap_setup.txt';
        $this->configureInitialAdmin($config);

        $this->ensureFiles();
        $this->ensureBootstrapUser();
    }

    /**
     * @return array<string, mixed>
     */
    public function status(): array
    {
        $user = $this->currentUser();
        return [
            'user' => $user,
            'csrf' => $user !== null ? $this->csrfToken() : null,
            'has_users' => $this->hasUsers(),
            'bootstrap_pending' => $this->bootstrapPending(),
            'setup_url_hint' => $this->bootstrapPending() ? 'Read bootstrap_setup.txt on the server.' : null,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listUsers(): array
    {
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        $users = array_map(fn (array $user): array => $this->accountUser($user), $data['users'] ?? []);

        usort($users, static function (array $left, array $right): int {
            $leftName = (string) ($left['username'] ?: $left['display_name']);
            $rightName = (string) ($right['username'] ?: $right['display_name']);
            return strcasecmp($leftName, $rightName);
        });

        return $users;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listAuditLog(int $limit = 200): array
    {
        if (!is_file($this->auditPath)) {
            return [];
        }

        $lines = file($this->auditPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return [];
        }

        $rows = [];
        foreach (array_slice($lines, -max(1, min($limit, 1000))) as $line) {
            try {
                $row = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                continue;
            }

            if (is_array($row)) {
                $rows[] = $row;
            }
        }

        return array_reverse($rows);
    }

    /**
     * @param array<int, string> $permissions
     * @return array<string, mixed>
     */
    public function createUser(string $username, string $displayName, array $permissions, ?string $createdBy, string $email = ''): array
    {
        $username = $this->normalizeUsername($username, false);
        $displayName = trim($displayName);
        $email = $this->normalizeEmail($email, true);
        $permissions = $this->normalizePermissions($permissions);
        $now = $this->now();

        return $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $displayName, $email, $permissions, $createdBy, $now): array {
            if ($username !== '') {
                $this->assertUsernameAvailable($data, $username, null);
            }

            $user = [
                'username' => $username,
                'display_name' => $displayName,
                'email' => $email,
                'enabled' => true,
                'permissions' => $permissions,
                'user_handle' => Base64Url::encode(random_bytes(32)),
                'credentials' => [],
                'created_at' => $now,
                'created_by' => $createdBy,
                'updated_at' => $now,
                'updated_by' => $createdBy,
                'last_login_at' => null,
            ];

            $data['users'][] = $user;
            return [$data, $this->publicUser($user)];
        });
    }

    /**
     * @param array<string, mixed> $patch
     * @return array<string, mixed>
     */
    public function updateUser(string $username, array $patch, ?string $updatedBy, bool $allowEmail = false, bool $includeEmail = false): array
    {
        $emailChanged = false;
        $updated = $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $patch, $updatedBy, $allowEmail, $includeEmail, &$emailChanged): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            $user = $data['users'][$index];
            if (array_key_exists('username', $patch)) {
                $newUsername = $this->normalizeUsername((string) $patch['username'], false);
                if (strcasecmp($newUsername, (string) ($user['username'] ?? '')) !== 0) {
                    throw new InvalidArgumentException('Username cannot be changed.');
                }
            }

            if (array_key_exists('display_name', $patch)) {
                $user['display_name'] = trim((string) $patch['display_name']);
            }

            if ($allowEmail && array_key_exists('email', $patch)) {
                $newEmail = $this->normalizeEmail((string) $patch['email'], true);
                $emailChanged = strcasecmp($newEmail, (string) ($user['email'] ?? '')) !== 0;
                $user['email'] = $newEmail;
            }

            if (array_key_exists('enabled', $patch)) {
                $user['enabled'] = (bool) $patch['enabled'];
            }

            if (array_key_exists('permissions', $patch) && is_array($patch['permissions'])) {
                $user['permissions'] = $this->normalizePermissions($patch['permissions']);
            }

            $user['updated_at'] = $this->now();
            $user['updated_by'] = $updatedBy;
            $data['users'][$index] = $user;

            return [$data, $includeEmail ? $this->accountUser($user) : $this->publicUser($user)];
        });

        if ($emailChanged) {
            $this->revokeLoginLinksForUser((string) ($updated['username'] ?? $username), $updatedBy);
        }

        return $updated;
    }

    /**
     * @param array<string, mixed> $patch
     * @return array<string, mixed>
     */
    public function updateAccount(string $username, array $patch): array
    {
        $allowedPatch = [];
        if (array_key_exists('display_name', $patch)) {
            $allowedPatch['display_name'] = $patch['display_name'];
        }
        if (array_key_exists('email', $patch)) {
            $allowedPatch['email'] = $patch['email'];
        }

        return $this->updateUser($username, $allowedPatch, $username, true, true);
    }

    /**
     * @return array{user: array<string, mixed>, passkeys: array<int, array<string, mixed>>}
     */
    public function account(string $username): array
    {
        $user = $this->findUserByUsername($username);
        if ($user === null || !($user['enabled'] ?? false)) {
            throw new InvalidArgumentException('Unknown user.');
        }

        return [
            'user' => $this->accountUser($user),
            'passkeys' => $this->publicCredentials(is_array($user['credentials'] ?? null) ? $user['credentials'] : []),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function userForPasskeyRegistration(string $username): array
    {
        $user = $this->findUserByUsername($username);
        if ($user === null || !($user['enabled'] ?? false)) {
            throw new InvalidArgumentException('Unknown user.');
        }

        return $user;
    }

    public function deleteUser(string $username, string $deletedBy): array
    {
        if (strcasecmp($username, $deletedBy) === 0) {
            throw new InvalidArgumentException('You cannot delete your own user.');
        }

        $deleted = $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $deletedBy): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            $user = $data['users'][$index];
            $remainingUsers = array_values(array_filter($data['users'] ?? [], static function (array $candidate) use ($username): bool {
                return strcasecmp((string) ($candidate['username'] ?? ''), $username) !== 0;
            }));
            $remainingManagers = array_filter($remainingUsers, static function (array $candidate): bool {
                $permissions = is_array($candidate['permissions'] ?? null) ? $candidate['permissions'] : [];
                return ($candidate['enabled'] ?? false) && in_array('manage_users', $permissions, true);
            });

            if (!$remainingManagers) {
                throw new InvalidArgumentException('At least one user manager must remain.');
            }

            $data['users'] = $remainingUsers;
            return [$data, $this->publicUser($user)];
        });

        $this->revokeSetupTokensForUser($username, $deletedBy);
        $this->revokeLoginLinksForUser($username, $deletedBy);
        $this->appendAudit('user_deleted', ['username' => $username, 'deleted_by' => $deletedBy]);
        return $deleted;
    }

    /**
     * @param array<string, mixed> $credential
     */
    public function addCredential(string $username, array $credential): void
    {
        $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $credential): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            $credentials = $data['users'][$index]['credentials'] ?? [];
            foreach ($credentials as $existing) {
                if (($existing['id'] ?? '') === ($credential['id'] ?? null)) {
                    throw new InvalidArgumentException('This passkey is already registered.');
                }
            }

            $credentials[] = $credential + [
                'created_at' => $this->now(),
                'last_used_at' => null,
            ];
            $data['users'][$index]['credentials'] = $credentials;
            $data['users'][$index]['updated_at'] = $this->now();

            return [$data, null];
        });

    }

    /**
     * @return array{user: array<string, mixed>, credential: array<string, mixed>}
     */
    public function findCredential(string $credentialId): array
    {
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        foreach ($data['users'] ?? [] as $user) {
            foreach (($user['credentials'] ?? []) as $credential) {
                if (($credential['id'] ?? '') === $credentialId) {
                    return ['user' => $user, 'credential' => $credential];
                }
            }
        }

        throw new InvalidArgumentException('Unknown passkey.');
    }

    public function updateCredentialAfterLogin(string $username, string $credentialId, int $signCount): void
    {
        $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $credentialId, $signCount): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            foreach (($data['users'][$index]['credentials'] ?? []) as $credentialIndex => $credential) {
                if (($credential['id'] ?? '') !== $credentialId) {
                    continue;
                }

                $data['users'][$index]['credentials'][$credentialIndex]['sign_count'] = $signCount;
                $data['users'][$index]['credentials'][$credentialIndex]['last_used_at'] = $this->now();
                $data['users'][$index]['last_login_at'] = $this->now();
                return [$data, null];
            }

            throw new InvalidArgumentException('Unknown passkey.');
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function deleteCredential(string $username, string $credentialId): array
    {
        $credentialId = trim($credentialId);
        if ($credentialId === '') {
            throw new InvalidArgumentException('Passkey ID is required.');
        }

        $deleted = $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username, $credentialId): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            $user = $data['users'][$index];
            $credentials = is_array($user['credentials'] ?? null) ? $user['credentials'] : [];
            $deletedCredential = null;
            $remaining = [];
            foreach ($credentials as $credential) {
                if (($credential['id'] ?? '') === $credentialId) {
                    $deletedCredential = $credential;
                    continue;
                }

                $remaining[] = $credential;
            }

            if ($deletedCredential === null) {
                throw new InvalidArgumentException('Unknown passkey.');
            }

            if ($remaining === [] && !$this->hasEmailLoginFallback($user)) {
                throw new InvalidArgumentException('At least one login method must remain.');
            }

            $data['users'][$index]['credentials'] = $remaining;
            $data['users'][$index]['updated_at'] = $this->now();
            $data['users'][$index]['updated_by'] = $username;

            return [$data, $this->publicCredential($deletedCredential)];
        });

        $this->appendAudit('passkey_deleted', ['username' => $username, 'credential_id' => $credentialId]);
        return $deleted;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function currentUser(): ?array
    {
        $this->startSession();
        $username = $_SESSION['username'] ?? null;
        if (!is_string($username) || $username === '') {
            return null;
        }

        $user = $this->findUserByUsername($username);
        if ($user === null || !($user['enabled'] ?? false)) {
            unset($_SESSION['username']);
            return null;
        }

        $_SESSION['username'] = (string) $user['username'];
        return $this->publicUser($user);
    }

    /**
     * @return array<string, mixed>
     */
    public function loginUser(string $username): array
    {
        $this->startSession();
        session_regenerate_id(true);
        $_SESSION['username'] = $username;
        $_SESSION['csrf'] = Base64Url::encode(random_bytes(32));

        $this->updateJson($this->usersPath, $this->defaultUsers(), function (array $data) use ($username): array {
            $index = $this->findUserIndex($data, $username);
            if ($index === null) {
                throw new InvalidArgumentException('Unknown user.');
            }

            $_SESSION['username'] = (string) ($data['users'][$index]['username'] ?? $username);
            $data['users'][$index]['last_login_at'] = $this->now();
            return [$data, null];
        });

        $user = $this->currentUser();
        if ($user === null) {
            throw new RuntimeException('Login failed.');
        }

        $this->appendAudit('login', ['username' => $user['username']]);
        return $user;
    }

    public function logout(): void
    {
        $this->startSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
        }

        session_destroy();
    }

    public function csrfToken(): string
    {
        $this->startSession();
        if (!isset($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
            $_SESSION['csrf'] = Base64Url::encode(random_bytes(32));
        }

        return $_SESSION['csrf'];
    }

    public function assertCsrf(?string $token): void
    {
        if ($this->currentUser() === null) {
            throw new RuntimeException('Authentication required.');
        }

        if (!is_string($token) || !hash_equals($this->csrfToken(), $token)) {
            throw new InvalidArgumentException('Invalid CSRF token.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function createSetupToken(string $username, ?string $createdBy, int $ttlHours = 168): array
    {
        $user = $this->findUserByUsername($username);
        if ($user === null || !($user['enabled'] ?? false)) {
            throw new InvalidArgumentException('Unknown user.');
        }

        $username = (string) $user['username'];
        $token = Base64Url::encode(random_bytes(32));
        $now = $this->now();
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + max(1, min($ttlHours, 24 * 30)) * 3600);

        $row = [
            'id' => $this->randomId('setup'),
            'username' => $username,
            'token_hash' => hash('sha256', $token),
            'created_at' => $now,
            'created_by' => $createdBy,
            'expires_at' => $expiresAt,
            'consumed_at' => null,
        ];

        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($row): array {
            $data['tokens'] = array_values(array_filter($data['tokens'] ?? [], function (array $token): bool {
                return $this->isActiveToken($token);
            }));
            $data['tokens'][] = $row;
            return [$data, null];
        });

        $this->appendAudit('setup_token_created', ['username' => $username, 'created_by' => $createdBy]);

        return [
            'id' => $row['id'],
            'username' => $username,
            'token' => $token,
            'setup_url' => $this->setupUrl($token),
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listSetupTokens(): array
    {
        $data = $this->readJson($this->tokensPath, $this->defaultTokens());
        $tokens = [];
        foreach (($data['tokens'] ?? []) as $token) {
            if (!$this->isActiveToken($token)) {
                continue;
            }

            $tokens[] = $this->publicSetupToken($token);
        }

        usort($tokens, static function (array $left, array $right): int {
            return strcmp((string) ($right['created_at'] ?? ''), (string) ($left['created_at'] ?? ''));
        });

        return $tokens;
    }

    public function deleteSetupToken(string $tokenId, ?string $deletedBy): array
    {
        $deleted = $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($tokenId, $deletedBy): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (($token['id'] ?? '') === $tokenId && $this->isActiveToken($token)) {
                    $data['tokens'][$index]['revoked_at'] = $this->now();
                    $data['tokens'][$index]['revoked_by'] = $deletedBy;
                    return [$data, $this->publicSetupToken($data['tokens'][$index])];
                }
            }

            throw new InvalidArgumentException('Setup token is not valid.');
        });

        $this->appendAudit('setup_token_deleted', ['token_id' => $tokenId, 'deleted_by' => $deletedBy]);
        return $deleted;
    }

    private function revokeSetupTokensForUser(string $username, ?string $deletedBy): void
    {
        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($username, $deletedBy): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (strcasecmp((string) ($token['username'] ?? ''), $username) === 0 && $this->isActiveToken($token)) {
                    $data['tokens'][$index]['revoked_at'] = $this->now();
                    $data['tokens'][$index]['revoked_by'] = $deletedBy;
                }
            }

            return [$data, null];
        });
    }

    /**
     * @return array{token: array<string, mixed>, user: array<string, mixed>}
     */
    public function resolveSetupToken(string $input): array
    {
        $input = trim($input);
        if ($input === '') {
            throw new InvalidArgumentException('Setup token is required.');
        }

        $tokenHash = hash('sha256', $input);
        $data = $this->readJson($this->tokensPath, $this->defaultTokens());

        foreach ($data['tokens'] ?? [] as $token) {
            if (!$this->isActiveToken($token)) {
                continue;
            }

            if (!hash_equals((string) ($token['token_hash'] ?? ''), $tokenHash)) {
                continue;
            }

            $user = $this->findUserByUsername((string) ($token['username'] ?? ''));
            if ($user === null || !($user['enabled'] ?? false)) {
                throw new InvalidArgumentException('Setup token is not valid.');
            }

            return ['token' => $token, 'user' => $user];
        }

        throw new InvalidArgumentException('Setup token is not valid.');
    }

    public function consumeSetupToken(string $tokenId): void
    {
        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($tokenId): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (($token['id'] ?? '') === $tokenId) {
                    $data['tokens'][$index]['consumed_at'] = $this->now();
                    return [$data, null];
                }
            }

            throw new InvalidArgumentException('Setup token is not valid.');
        });

        if (!$this->bootstrapPending()) {
            $this->deleteBootstrapFiles();
        }
    }

    /**
     * @param array<string, mixed> $credential
     */
    public function completeSetupRegistration(
        string $input,
        string $tokenId,
        string $username,
        array $credential
    ): void {
        $tokenHash = hash('sha256', trim($input));
        $reservationId = $this->randomId('setup_registration');
        $reservedAt = $this->now();

        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use (
            $tokenHash,
            $tokenId,
            $username,
            $reservationId,
            $reservedAt
        ): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (($token['id'] ?? '') !== $tokenId
                    || strcasecmp((string) ($token['username'] ?? ''), $username) !== 0
                    || !$this->isActiveToken($token)
                    || !hash_equals((string) ($token['token_hash'] ?? ''), $tokenHash)
                ) {
                    continue;
                }

                $data['tokens'][$index]['registration_reservation_id'] = $reservationId;
                $data['tokens'][$index]['registration_reserved_at'] = $reservedAt;
                return [$data, null];
            }

            throw new InvalidArgumentException('Setup token is not valid.');
        });

        try {
            $this->addCredential($username, $credential);
        } catch (\Throwable $exception) {
            $this->releaseSetupRegistrationReservation($tokenId, $reservationId);
            throw $exception;
        }

        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($tokenId, $reservationId): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (($token['id'] ?? '') !== $tokenId
                    || !hash_equals((string) ($token['registration_reservation_id'] ?? ''), $reservationId)
                    || ($token['consumed_at'] ?? null) !== null
                ) {
                    continue;
                }

                $data['tokens'][$index]['consumed_at'] = $this->now();
                unset(
                    $data['tokens'][$index]['registration_reservation_id'],
                    $data['tokens'][$index]['registration_reserved_at']
                );
                return [$data, null];
            }

            throw new RuntimeException('Could not finalize setup token consumption.');
        });

        if (!$this->bootstrapPending()) {
            $this->deleteBootstrapFiles();
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function createEmailLoginLink(string $email): ?array
    {
        $email = $this->normalizeEmail($email, false);
        $user = $this->findUserByEmail($email);
        if ($user === null || !($user['enabled'] ?? false)) {
            return null;
        }

        $username = (string) $user['username'];
        $token = Base64Url::encode(random_bytes(32));
        $now = $this->now();
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + $this->loginLinkTtlSeconds);
        $row = [
            'id' => $this->randomId('login'),
            'username' => $username,
            'email' => $email,
            'token_hash' => hash('sha256', $token),
            'created_at' => $now,
            'expires_at' => $expiresAt,
            'consumed_at' => null,
            'revoked_at' => null,
            'revoked_by' => null,
        ];

        $link = $this->updateJson($this->loginLinksPath, $this->defaultLoginLinks(), function (array $data) use ($row, $token, $user): array {
            $data['links'] = array_values(array_filter($data['links'] ?? [], function (array $link): bool {
                return $this->isRetainedLoginLink($link);
            }));

            foreach ($data['links'] as $existing) {
                if (strcasecmp((string) ($existing['username'] ?? ''), (string) $row['username']) === 0
                    && $this->isActiveLoginLink($existing)) {
                    return [$data, [
                        'created' => false,
                        'id' => (string) ($existing['id'] ?? ''),
                        'username' => (string) ($existing['username'] ?? ''),
                        'email' => (string) ($existing['email'] ?? ''),
                        'expires_at' => $existing['expires_at'] ?? null,
                        'user' => $this->publicUser($user),
                    ]];
                }
            }

            $data['links'][] = $row;
            return [$data, [
                'created' => true,
                'id' => $row['id'],
                'username' => $row['username'],
                'email' => $row['email'],
                'token' => $token,
                'login_url' => $this->loginUrl($token),
                'expires_at' => $row['expires_at'],
                'user' => $this->publicUser($user),
            ]];
        });

        if (($link['created'] ?? false) === true) {
            $this->appendAudit('email_login_link_created', ['username' => $username]);
        }

        return $link;
    }

    public function revokeEmailLoginLink(string $linkId, ?string $revokedBy): void
    {
        if (trim($linkId) === '') {
            return;
        }

        $this->updateJson($this->loginLinksPath, $this->defaultLoginLinks(), function (array $data) use ($linkId, $revokedBy): array {
            foreach (($data['links'] ?? []) as $index => $link) {
                if (($link['id'] ?? '') === $linkId && $this->isActiveLoginLink($link)) {
                    $data['links'][$index]['revoked_at'] = $this->now();
                    $data['links'][$index]['revoked_by'] = $revokedBy;
                }
            }

            return [$data, null];
        });
    }

    private function revokeLoginLinksForUser(string $username, ?string $revokedBy): void
    {
        $this->updateJson($this->loginLinksPath, $this->defaultLoginLinks(), function (array $data) use ($username, $revokedBy): array {
            foreach (($data['links'] ?? []) as $index => $link) {
                if (strcasecmp((string) ($link['username'] ?? ''), $username) === 0 && $this->isActiveLoginLink($link)) {
                    $data['links'][$index]['revoked_at'] = $this->now();
                    $data['links'][$index]['revoked_by'] = $revokedBy;
                }
            }

            return [$data, null];
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function consumeEmailLoginToken(string $input): array
    {
        $input = trim($input);
        if ($input === '') {
            throw new InvalidArgumentException('Login link is required.');
        }

        $tokenHash = hash('sha256', $input);
        $username = $this->updateJson($this->loginLinksPath, $this->defaultLoginLinks(), function (array $data) use ($tokenHash): array {
            foreach (($data['links'] ?? []) as $index => $link) {
                if (!$this->isActiveLoginLink($link)) {
                    continue;
                }

                if (!hash_equals((string) ($link['token_hash'] ?? ''), $tokenHash)) {
                    continue;
                }

                $data['links'][$index]['consumed_at'] = $this->now();
                return [$data, (string) ($link['username'] ?? '')];
            }

            throw new InvalidArgumentException('Login link is not valid.');
        });

        $user = $this->findUserByUsername($username);
        if ($user === null || !($user['enabled'] ?? false)) {
            throw new InvalidArgumentException('Login link is not valid.');
        }

        $loggedIn = $this->loginUser((string) $user['username']);
        $this->appendAudit('email_login', ['username' => $loggedIn['username']]);
        return $loggedIn;
    }

    /**
     * @param array<string, mixed> $context
     * @return array<string, string>
     */
    public function createChallenge(string $purpose, array $context, int $ttlSeconds = 300): array
    {
        $challenge = Base64Url::encode(random_bytes(32));
        $row = [
            'id' => $this->randomId('challenge'),
            'purpose' => $purpose,
            'challenge' => $challenge,
            'challenge_hash' => hash('sha256', $challenge),
            'context' => $context,
            'created_at' => $this->now(),
            'expires_at' => gmdate('Y-m-d\TH:i:s\Z', time() + max(60, min($ttlSeconds, 900))),
            'consumed_at' => null,
        ];

        $this->updateJson($this->challengesPath, $this->defaultChallenges(), function (array $data) use ($row): array {
            $data['challenges'] = array_values(array_filter($data['challenges'] ?? [], function (array $challenge): bool {
                return $this->isActiveChallenge($challenge);
            }));
            $data['challenges'][] = $row;
            return [$data, null];
        });

        return ['id' => $row['id'], 'challenge' => $challenge];
    }

    /**
     * @return array<string, mixed>
     */
    public function consumeChallengeById(string $purpose, string $challengeId): array
    {
        return $this->updateJson($this->challengesPath, $this->defaultChallenges(), function (array $data) use ($purpose, $challengeId): array {
            foreach (($data['challenges'] ?? []) as $index => $row) {
                if (($row['id'] ?? '') !== $challengeId || ($row['purpose'] ?? '') !== $purpose || !$this->isActiveChallenge($row)) {
                    continue;
                }

                $data['challenges'][$index]['consumed_at'] = $this->now();
                return [$data, [
                    'challenge' => (string) ($row['challenge'] ?? ''),
                    'context' => is_array($row['context'] ?? null) ? $row['context'] : [],
                ]];
            }

            throw new InvalidArgumentException('Challenge expired or was already used.');
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function consumeChallenge(string $purpose, string $challenge): array
    {
        return $this->updateJson($this->challengesPath, $this->defaultChallenges(), function (array $data) use ($purpose, $challenge): array {
            $challengeHash = hash('sha256', $challenge);
            foreach (($data['challenges'] ?? []) as $index => $row) {
                if (($row['purpose'] ?? '') !== $purpose || !$this->isActiveChallenge($row)) {
                    continue;
                }

                if (!hash_equals((string) ($row['challenge_hash'] ?? ''), $challengeHash)) {
                    continue;
                }

                $data['challenges'][$index]['consumed_at'] = $this->now();
                return [$data, is_array($row['context'] ?? null) ? $row['context'] : []];
            }

            throw new InvalidArgumentException('Challenge expired or was already used.');
        });
    }

    public function hasPermission(string $permission): bool
    {
        $user = $this->currentUser();
        return $user !== null && in_array($permission, $user['permissions'], true);
    }

    private function ensureFiles(): void
    {
        if (!is_dir($this->authPath) && !mkdir($this->authPath, 0775, true) && !is_dir($this->authPath)) {
            throw new RuntimeException('Could not create auth directory.');
        }

        $this->ensureJsonFile($this->usersPath, $this->defaultUsers());
        $this->ensureJsonFile($this->tokensPath, $this->defaultTokens());
        $this->ensureJsonFile($this->challengesPath, $this->defaultChallenges());
        $this->ensureJsonFile($this->loginLinksPath, $this->defaultLoginLinks());
    }

    /**
     * @param array<string, mixed> $config
     */
    private function configureInitialAdmin(array $config): void
    {
        $authConfig = is_array($config['auth'] ?? null) ? $config['auth'] : [];

        $username = is_string($authConfig['initial_admin_username'] ?? null)
            ? $authConfig['initial_admin_username']
            : $this->initialAdminUsername;

        $this->initialAdminUsername = $this->normalizeUsername($username, false);

        if (is_string($authConfig['base_url'] ?? null) && trim($authConfig['base_url']) !== '') {
            $this->baseUrl = rtrim(trim($authConfig['base_url']), '/');
        }

        $this->loginLinkTtlSeconds = Config::loginLinkTtlSeconds($config);

        $mailConfig = is_array($config['mail'] ?? null) ? $config['mail'] : [];
        $this->emailLoginAvailable = (bool) ($mailConfig['enabled'] ?? false)
            && is_string($mailConfig['from_address'] ?? null)
            && filter_var($mailConfig['from_address'], FILTER_VALIDATE_EMAIL) !== false;
    }

    private function ensureBootstrapUser(): void
    {
        if ($this->hasUsers()) {
            return;
        }

        $admin = $this->createUser($this->initialAdminUsername, '', self::PERMISSIONS, null);
        $setup = $this->createSetupToken((string) $admin['username'], null, 24 * 30);

        $content = implode(PHP_EOL, [
            'Initial admin passkey setup',
            '',
            'Initial admin username:',
            $this->initialAdminUsername,
            '',
            'Open this URL:',
            $setup['setup_url'],
            '',
            'This token is single-use and expires at ' . $setup['expires_at'] . '.',
        ]) . PHP_EOL;

        file_put_contents($this->bootstrapPath, $content, LOCK_EX);
    }

    private function bootstrapPending(): bool
    {
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        foreach ($data['users'] ?? [] as $user) {
            if (count($user['credentials'] ?? []) > 0) {
                return false;
            }
        }

        return is_file($this->bootstrapPath);
    }

    private function deleteBootstrapFiles(): void
    {
        @unlink($this->bootstrapPath);
    }

    private function hasUsers(): bool
    {
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        return count($data['users'] ?? []) > 0;
    }

    private function setupUrl(string $token): string
    {
        if ($this->baseUrl === null) {
            throw new RuntimeException('auth.base_url must be configured before setup links can be generated.');
        }

        return $this->baseUrl . '/#setup=' . rawurlencode($token);
    }

    private function loginUrl(string $token): string
    {
        if ($this->baseUrl === null) {
            throw new RuntimeException('auth.base_url must be configured before login links can be generated.');
        }

        return $this->baseUrl . '/#login=' . rawurlencode($token);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findUserByUsername(string $username): ?array
    {
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        $index = $this->findUserIndex($data, $username);
        return $index === null ? null : $data['users'][$index];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findUserByEmail(string $email): ?array
    {
        $needle = strtolower($this->normalizeEmail($email, false));
        $data = $this->readJson($this->usersPath, $this->defaultUsers());
        foreach (($data['users'] ?? []) as $user) {
            $candidate = strtolower(trim((string) ($user['email'] ?? '')));
            if ($candidate !== '' && hash_equals($candidate, $needle)) {
                return $user;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function findUserIndex(array $data, string $username): ?int
    {
        $needle = trim($username);
        foreach (($data['users'] ?? []) as $index => $user) {
            if (strcasecmp((string) ($user['username'] ?? ''), $needle) === 0) {
                return $index;
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function assertUsernameAvailable(array $data, string $username, ?string $exceptUsername): void
    {
        foreach (($data['users'] ?? []) as $user) {
            if ($exceptUsername !== null && strcasecmp((string) ($user['username'] ?? ''), $exceptUsername) === 0) {
                continue;
            }

            if (strcasecmp((string) ($user['username'] ?? ''), $username) === 0) {
                throw new InvalidArgumentException('Username is already in use.');
            }
        }
    }

    /**
     * @param array<string, mixed> $user
     * @return array<string, mixed>
     */
    private function publicUser(array $user): array
    {
        $permissions = is_array($user['permissions'] ?? null) ? $user['permissions'] : [];

        return [
            'username' => (string) ($user['username'] ?? ''),
            'display_name' => (string) ($user['display_name'] ?? ''),
            'enabled' => (bool) ($user['enabled'] ?? false),
            'permissions' => array_values(array_intersect(self::PERMISSIONS, $permissions)),
            'credential_count' => count($user['credentials'] ?? []),
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null,
            'last_login_at' => $user['last_login_at'] ?? null,
            'needs_setup' => count($user['credentials'] ?? []) === 0,
        ];
    }

    /**
     * @param array<string, mixed> $user
     * @return array<string, mixed>
     */
    private function accountUser(array $user): array
    {
        return $this->publicUser($user) + [
            'email' => (string) ($user['email'] ?? ''),
        ];
    }

    /**
     * @param array<int, array<string, mixed>> $credentials
     * @return array<int, array<string, mixed>>
     */
    private function publicCredentials(array $credentials): array
    {
        return array_map(fn (array $credential): array => $this->publicCredential($credential), $credentials);
    }

    /**
     * @param array<string, mixed> $credential
     * @return array<string, mixed>
     */
    private function publicCredential(array $credential): array
    {
        return [
            'id' => (string) ($credential['id'] ?? ''),
            'created_at' => $credential['created_at'] ?? null,
            'last_used_at' => $credential['last_used_at'] ?? null,
            'transports' => array_values(array_filter(
                is_array($credential['transports'] ?? null) ? $credential['transports'] : [],
                'is_string'
            )),
            'client_origin' => is_string($credential['client_origin'] ?? null) ? $credential['client_origin'] : '',
        ];
    }

    /**
     * @param array<string, mixed> $token
     * @return array<string, mixed>
     */
    private function publicSetupToken(array $token): array
    {
        return [
            'id' => (string) ($token['id'] ?? ''),
            'username' => (string) ($token['username'] ?? ''),
            'created_at' => $token['created_at'] ?? null,
            'created_by' => $token['created_by'] ?? null,
            'expires_at' => $token['expires_at'] ?? null,
            'revoked_at' => $token['revoked_at'] ?? null,
        ];
    }

    private function normalizeUsername(string $username, bool $allowEmpty): string
    {
        $username = trim($username);
        if ($username === '' && $allowEmpty) {
            return '';
        }

        if (strpos($username, ',') !== false) {
            throw new InvalidArgumentException('Username must not contain commas.');
        }

        if ($username === '' || strlen($username) > 64 || preg_match('/^[A-Za-z0-9_.@-]{2,64}$/', $username) !== 1) {
            throw new InvalidArgumentException('Username must be 2-64 characters and use only letters, numbers, dot, dash, underscore, or @.');
        }

        return $username;
    }

    private function normalizeEmail(string $email, bool $allowEmpty): string
    {
        $email = strtolower(trim($email));
        if ($email === '' && $allowEmpty) {
            return '';
        }

        if ($email === '' || strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new InvalidArgumentException('Invalid email address.');
        }

        return $email;
    }

    /**
     * @param array<int, mixed> $permissions
     * @return array<int, string>
     */
    private function normalizePermissions(array $permissions): array
    {
        $normalized = [];
        foreach ($permissions as $permission) {
            if (!is_string($permission) || !in_array($permission, self::PERMISSIONS, true)) {
                throw new InvalidArgumentException('Unknown permission.');
            }

            $normalized[] = $permission;
        }

        return array_values(array_unique($normalized));
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultUsers(): array
    {
        return ['schema_version' => 2, 'users' => []];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultTokens(): array
    {
        return ['schema_version' => 2, 'tokens' => []];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultChallenges(): array
    {
        return ['schema_version' => 2, 'challenges' => []];
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultLoginLinks(): array
    {
        return ['schema_version' => 1, 'links' => []];
    }

    /**
     * @param array<string, mixed> $default
     */
    private function ensureJsonFile(string $path, array $default): void
    {
        if (is_file($path)) {
            return;
        }

        $this->writeJson($path, $default);
    }

    /**
     * @param array<string, mixed> $default
     * @return array<string, mixed>
     */
    private function readJson(string $path, array $default): array
    {
        if (!is_file($path)) {
            return $default;
        }

        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') {
            return $default;
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new RuntimeException('Invalid auth JSON: ' . basename($path), 0, $exception);
        }

        if (!is_array($decoded)) {
            throw new RuntimeException('Auth JSON root must be an object.');
        }

        return array_replace($default, $decoded);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function writeJson(string $path, array $data): void
    {
        $tmp = $path . '.tmp.' . bin2hex(random_bytes(6));
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if ($json === false || file_put_contents($tmp, $json . PHP_EOL, LOCK_EX) === false) {
            throw new RuntimeException('Could not write auth JSON.');
        }

        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException('Could not replace auth JSON.');
        }
    }

    /**
     * @param array<string, mixed> $default
     * @return mixed
     */
    private function updateJson(string $path, array $default, callable $callback)
    {
        $lockPath = $path . '.lock';
        $lock = fopen($lockPath, 'c');
        if ($lock === false || !flock($lock, LOCK_EX)) {
            throw new RuntimeException('Could not lock auth JSON.');
        }

        try {
            $data = $this->readJson($path, $default);
            $result = $callback($data);
            if (!is_array($result) || count($result) !== 2 || !is_array($result[0])) {
                throw new RuntimeException('Invalid auth update result.');
            }

            $this->writeJson($path, $result[0]);
            return $result[1];
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @param array<string, mixed> $token
     */
    private function isActiveToken(array $token): bool
    {
        $reservedAt = strtotime((string) ($token['registration_reserved_at'] ?? ''));
        $hasActiveReservation = ($token['registration_reservation_id'] ?? '') !== ''
            && $reservedAt !== false
            && $reservedAt > time() - 300;

        return ($token['consumed_at'] ?? null) === null
            && ($token['revoked_at'] ?? null) === null
            && !$hasActiveReservation
            && is_string($token['expires_at'] ?? null)
            && strtotime($token['expires_at']) !== false
            && strtotime($token['expires_at']) > time();
    }

    private function releaseSetupRegistrationReservation(string $tokenId, string $reservationId): void
    {
        $this->updateJson($this->tokensPath, $this->defaultTokens(), function (array $data) use ($tokenId, $reservationId): array {
            foreach (($data['tokens'] ?? []) as $index => $token) {
                if (($token['id'] ?? '') === $tokenId
                    && hash_equals((string) ($token['registration_reservation_id'] ?? ''), $reservationId)
                ) {
                    unset(
                        $data['tokens'][$index]['registration_reservation_id'],
                        $data['tokens'][$index]['registration_reserved_at']
                    );
                    break;
                }
            }

            return [$data, null];
        });
    }

    /**
     * @param array<string, mixed> $challenge
     */
    private function isActiveChallenge(array $challenge): bool
    {
        return ($challenge['consumed_at'] ?? null) === null
            && is_string($challenge['expires_at'] ?? null)
            && strtotime($challenge['expires_at']) !== false
            && strtotime($challenge['expires_at']) > time();
    }

    /**
     * @param array<string, mixed> $link
     */
    private function isActiveLoginLink(array $link): bool
    {
        return ($link['consumed_at'] ?? null) === null
            && ($link['revoked_at'] ?? null) === null
            && is_string($link['expires_at'] ?? null)
            && strtotime($link['expires_at']) !== false
            && strtotime($link['expires_at']) > time();
    }

    /**
     * @param array<string, mixed> $link
     */
    private function isRetainedLoginLink(array $link): bool
    {
        if ($this->isActiveLoginLink($link)) {
            return true;
        }

        $createdAt = strtotime((string) ($link['created_at'] ?? ''));
        return $createdAt !== false && $createdAt > time() - 86400;
    }

    /**
     * @param array<string, mixed> $user
     */
    private function hasEmailLoginFallback(array $user): bool
    {
        if (!$this->emailLoginAvailable) {
            return false;
        }

        try {
            return $this->normalizeEmail((string) ($user['email'] ?? ''), true) !== '';
        } catch (InvalidArgumentException $exception) {
            return false;
        }
    }

    /**
     * @param array<string, mixed> $fields
     */
    private function appendAudit(string $event, array $fields): void
    {
        $row = ['at' => $this->now(), 'event' => $event] + $fields;
        $json = json_encode($row, JSON_UNESCAPED_SLASHES);
        if ($json !== false) {
            file_put_contents($this->auditPath, $json . PHP_EOL, FILE_APPEND | LOCK_EX);
        }
    }

    private function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function randomId(string $prefix): string
    {
        return $prefix . '_' . Base64Url::encode(random_bytes(16));
    }

    private function now(): string
    {
        return gmdate('Y-m-d\TH:i:s\Z');
    }
}
