<?php
declare(strict_types=1);

use Stammbaum\AuthStore;
use Stammbaum\Http;
use Stammbaum\StorageConflictException;
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

function object_access(AuthStore $auth): string
{
    $canReadData = $auth->hasPermission('read') || $auth->hasPermission('write');
    if ($canReadData && $auth->hasPermission('sensitive')) {
        return 'protected';
    }

    return $canReadData ? 'private' : 'public';
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

try {
    switch ($action) {
        case 'status':
            Http::requireMethod('GET');
            $authStatus = $auth->status();
            $access = object_access($auth);
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
                'storage' => $storage->status($access),
            ]);
            break;

        case 'objects':
            Http::requireMethod('GET');
            $access = object_access($auth);
            $type = (string) ($_GET['type'] ?? '');
            Http::json([
                'ok' => true,
                'type' => $type,
                'objects' => $storage->listObjects($type, $access),
            ]);
            break;

        case 'object':
            Http::requireMethod('GET');
            $access = object_access($auth);
            $type = (string) ($_GET['type'] ?? '');
            $id = (string) ($_GET['id'] ?? '');
            Http::json([
                'ok' => true,
                'type' => $type,
                'object' => $storage->readObject($type, $id, $access),
            ]);
            break;

        case 'object-schema':
            Http::requireMethod('GET');
            Http::json([
                'ok' => true,
                'schemas' => $storage->schemas(object_access($auth)),
            ]);
            break;

        case 'object-create':
            Http::requireMethod('POST');
            $editor = require_permission($auth, 'write');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $type = (string) ($body['type'] ?? '');
            $payload = is_array($body['object'] ?? null) ? $body['object'] : [];
            Http::json([
                'ok' => true,
                'type' => $type,
                'object' => $storage->createObject($type, $payload, (string) $editor['id'], object_access($auth)),
            ]);
            break;

        case 'object-update':
            Http::requireMethod('POST');
            $editor = require_permission($auth, 'write');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $type = (string) ($body['type'] ?? '');
            $id = (string) ($body['id'] ?? '');
            $payload = is_array($body['object'] ?? null) ? $body['object'] : (is_array($body['patch'] ?? null) ? $body['patch'] : []);
            $baseRevision = (int) ($body['base_revision'] ?? 0);
            Http::json([
                'ok' => true,
                'type' => $type,
                'object' => $storage->updateObject($type, $id, $baseRevision, $payload, (string) $editor['id'], object_access($auth)),
            ]);
            break;

        case 'object-delete':
            Http::requireMethod('POST');
            $editor = require_permission($auth, 'write');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $type = (string) ($body['type'] ?? '');
            $id = (string) ($body['id'] ?? '');
            $baseRevision = (int) ($body['base_revision'] ?? 0);
            Http::json([
                'ok' => true,
                'type' => $type,
                'object' => $storage->deleteObject($type, $id, $baseRevision, (string) $editor['id'], object_access($auth)),
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
                'setup_tokens' => $auth->listSetupTokens(),
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
            Http::json(['ok' => true, 'user' => $user, 'setup' => $setup]);
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

        case 'admin-delete-user':
            Http::requireMethod('POST');
            $admin = require_permission($auth, 'manage_users');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $userId = (string) ($body['user_id'] ?? '');
            if ($userId === '') {
                Http::json(['ok' => false, 'error' => 'User ID is required'], 400);
            }

            $auth->deleteUser($userId, (string) $admin['id']);
            Http::json([
                'ok' => true,
                'users' => $auth->listUsers(),
                'setup_tokens' => $auth->listSetupTokens(),
            ]);
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
            Http::json(['ok' => true, 'setup' => $setup]);
            break;

        case 'admin-delete-setup-token':
            Http::requireMethod('POST');
            $admin = require_permission($auth, 'manage_users');
            $body = Http::readJsonBody();
            require_csrf($auth, $body);
            $tokenId = (string) ($body['token_id'] ?? '');
            if ($tokenId === '') {
                Http::json(['ok' => false, 'error' => 'Setup token ID is required'], 400);
            }

            $auth->deleteSetupToken($tokenId, (string) $admin['id']);
            Http::json(['ok' => true, 'setup_tokens' => $auth->listSetupTokens()]);
            break;

        default:
            Http::json(['ok' => false, 'error' => 'Unknown action'], 404);
    }
} catch (StorageConflictException $exception) {
    Http::json([
        'ok' => false,
        'error' => $exception->getMessage(),
        'conflict' => true,
        'current' => $exception->currentObject(),
    ], 409);
} catch (InvalidArgumentException $exception) {
    Http::json(['ok' => false, 'error' => $exception->getMessage()], 400);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    Http::json(['ok' => false, 'error' => 'Internal server error'], 500);
}
