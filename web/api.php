<?php
declare(strict_types=1);

use Stammbaum\AuthStore;
use Stammbaum\Http;
use Stammbaum\WebAuthn;

$app = require __DIR__ . '/app/bootstrap.php';

Http::sendSecurityHeaders();

$storage = $app['storage'];
$config = $app['config'];
$auth = $app['auth'];
$webauthn = WebAuthn::fromRequest($config);
$version = $app['version'];
$action = $_GET['action'] ?? 'status';

/**
 * @return array<string, mixed>
 */
function require_user(AuthStore $auth): array
{
    $user = $auth->currentUser();
    if ($user === null) {
        Http::json(['ok' => false, 'error' => 'Authentication required'], 401);
    }

    return $user;
}

/**
 * @return array<string, mixed>
 */
function require_permission(AuthStore $auth, string $permission): array
{
    $user = require_user($auth);
    if (!in_array($permission, $user['permissions'], true)) {
        Http::json(['ok' => false, 'error' => 'Permission denied'], 403);
    }

    return $user;
}

/**
 * @param array<string, mixed> $body
 */
function require_csrf(AuthStore $auth, array $body): void
{
    require_user($auth);
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($body['csrf'] ?? null);
    try {
        $auth->assertCsrf(is_string($token) ? $token : null);
    } catch (InvalidArgumentException $exception) {
        Http::json(['ok' => false, 'error' => 'Invalid CSRF token'], 403);
    }
}

/**
 * @param array<string, mixed> $setup
 * @return array<string, mixed>
 */
function present_setup(array $setup): array
{
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    $scheme = $https ? 'https' : 'http';
    $base = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/api.php'))), '/');
    if ($base === '' || $base === '.') {
        $base = '';
    }

    return $setup + [
        'setup_url' => $scheme . '://' . $host . $base . '/?setup=' . rawurlencode((string) $setup['token']),
    ];
}

try {
    switch ($action) {
        case 'status':
            Http::requireMethod('GET');
            $authStatus = $auth->status();
            $canRead = $auth->hasPermission('read');
            Http::json([
                'ok' => true,
                'app' => [
                    'name' => $config['name'],
                    'version' => $version,
                    'timezone' => $config['timezone'],
                    'show_warnings' => $config['show_warnings'],
                    'warnings' => $config['warnings'] !== [] ? $config['warnings'] : null,
                ],
                'auth' => $authStatus,
                'webauthn' => $webauthn->publicContext(),
                'storage' => $canRead ? $storage->status() : null,
            ]);
            break;

        case 'objects':
            Http::requireMethod('GET');
            require_permission($auth, 'read');
            $type = (string) ($_GET['type'] ?? '');
            Http::json([
                'ok' => true,
                'type' => $type,
                'objects' => $storage->listObjects($type),
            ]);
            break;

        case 'auth-login-options':
            Http::requireMethod('POST');
            $challenge = $auth->createChallenge('login', [], 300);
            Http::json([
                'ok' => true,
                'challenge_id' => $challenge['id'],
                'publicKey' => $webauthn->authenticationOptions($challenge['challenge']),
            ]);
            break;

        case 'auth-login-verify':
            Http::requireMethod('POST');
            $body = Http::readJsonBody();
            $challengeId = (string) ($body['challenge_id'] ?? '');
            $credential = $body['credential'] ?? null;
            if ($challengeId === '' || !is_array($credential)) {
                Http::json(['ok' => false, 'error' => 'Missing login response'], 400);
            }

            $challenge = $auth->consumeChallengeById('login', $challengeId);
            $credentialId = (string) ($credential['id'] ?? $credential['rawId'] ?? '');
            $stored = $auth->findCredential($credentialId);
            if (!($stored['user']['enabled'] ?? false)) {
                Http::json(['ok' => false, 'error' => 'User is disabled'], 403);
            }

            $verified = $webauthn->verifyAuthentication($credential, (string) $challenge['challenge'], $stored['credential']);
            $auth->updateCredentialAfterLogin((string) $stored['user']['id'], (string) $verified['credential_id'], (int) $verified['sign_count']);
            $user = $auth->loginUser((string) $stored['user']['id']);
            Http::json(['ok' => true, 'user' => $user, 'csrf' => $auth->csrfToken()]);
            break;

        case 'auth-register-options':
            Http::requireMethod('POST');
            $body = Http::readJsonBody();
            $setupInput = (string) ($body['setup'] ?? $body['token'] ?? '');
            $resolved = $auth->resolveSetupToken($setupInput);
            $user = $resolved['user'];

            if ((string) ($user['username'] ?? '') === '') {
                $username = trim((string) ($body['username'] ?? ''));
                if ($username === '') {
                    Http::json(['ok' => false, 'error' => 'Username is required for this setup link', 'username_required' => true], 422);
                }

                $auth->setUsernameIfEmpty((string) $user['id'], $username);
                $resolved = $auth->resolveSetupToken($setupInput);
                $user = $resolved['user'];
            }

            $challenge = $auth->createChallenge('register', [
                'setup_token_id' => (string) $resolved['token']['id'],
                'user_id' => (string) $user['id'],
            ], 300);

            Http::json([
                'ok' => true,
                'challenge_id' => $challenge['id'],
                'publicKey' => $webauthn->registrationOptions($challenge['challenge'], $user, $user['credentials'] ?? []),
            ]);
            break;

        case 'auth-register-verify':
            Http::requireMethod('POST');
            $body = Http::readJsonBody();
            $setupInput = (string) ($body['setup'] ?? $body['token'] ?? '');
            $challengeId = (string) ($body['challenge_id'] ?? '');
            $credential = $body['credential'] ?? null;
            if ($setupInput === '' || $challengeId === '' || !is_array($credential)) {
                Http::json(['ok' => false, 'error' => 'Missing registration response'], 400);
            }

            $resolved = $auth->resolveSetupToken($setupInput);
            $challenge = $auth->consumeChallengeById('register', $challengeId);
            $context = is_array($challenge['context'] ?? null) ? $challenge['context'] : [];
            if (($context['setup_token_id'] ?? '') !== ($resolved['token']['id'] ?? '')
                || ($context['user_id'] ?? '') !== ($resolved['user']['id'] ?? '')) {
                Http::json(['ok' => false, 'error' => 'Registration challenge did not match setup token'], 400);
            }

            $storedCredential = $webauthn->verifyRegistration($credential, (string) $challenge['challenge']);
            $auth->addCredential((string) $resolved['user']['id'], $storedCredential);
            $auth->consumeSetupToken((string) $resolved['token']['id']);
            $user = $auth->loginUser((string) $resolved['user']['id']);
            Http::json(['ok' => true, 'user' => $user, 'csrf' => $auth->csrfToken()]);
            break;

        case 'auth-logout':
            Http::requireMethod('POST');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $auth->logout();
            Http::json(['ok' => true]);
            break;

        case 'admin-users':
            Http::requireMethod('GET');
            require_permission($auth, 'manage_users');
            Http::json([
                'ok' => true,
                'permissions' => AuthStore::PERMISSIONS,
                'users' => $auth->listUsers(),
            ]);
            break;

        case 'admin-create-user':
            Http::requireMethod('POST');
            $admin = require_permission($auth, 'manage_users');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $username = trim((string) ($body['username'] ?? ''));
            if ($username === '') {
                Http::json(['ok' => false, 'error' => 'Username is required'], 400);
            }

            $permissions = is_array($body['permissions'] ?? null) ? $body['permissions'] : ['read'];
            $user = $auth->createUser(
                $username,
                (string) ($body['display_name'] ?? ''),
                $permissions,
                (string) $admin['id']
            );
            $setup = $auth->createSetupToken((string) $user['id'], (string) $admin['id']);
            Http::json(['ok' => true, 'user' => $user, 'setup' => present_setup($setup)]);
            break;

        case 'admin-update-user':
            Http::requireMethod('POST');
            $admin = require_permission($auth, 'manage_users');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $userId = (string) ($body['user_id'] ?? '');
            if ($userId === '') {
                Http::json(['ok' => false, 'error' => 'User ID is required'], 400);
            }

            $user = $auth->updateUser($userId, $body, (string) $admin['id']);
            Http::json(['ok' => true, 'user' => $user]);
            break;

        case 'admin-create-setup-token':
            Http::requireMethod('POST');
            $admin = require_permission($auth, 'manage_users');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $userId = (string) ($body['user_id'] ?? '');
            if ($userId === '') {
                Http::json(['ok' => false, 'error' => 'User ID is required'], 400);
            }

            $setup = $auth->createSetupToken($userId, (string) $admin['id']);
            Http::json(['ok' => true, 'setup' => present_setup($setup)]);
            break;

        default:
            Http::json(['ok' => false, 'error' => 'Unknown action'], 404);
    }
} catch (InvalidArgumentException $exception) {
    Http::json(['ok' => false, 'error' => $exception->getMessage()], 400);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    Http::json(['ok' => false, 'error' => 'Internal server error'], 500);
}
