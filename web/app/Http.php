<?php
declare(strict_types=1);

namespace Stammbaum;

final class Http
{
    /**
     * @param array<string, mixed> $config
     */
    public static function enforceRequestSecurity(array $config): void
    {
        $auth = is_array($config['auth'] ?? null) ? $config['auth'] : [];
        $allowedHosts = is_array($auth['allowed_hosts'] ?? null) ? $auth['allowed_hosts'] : [];
        $requestHost = self::requestHostname((string) ($_SERVER['HTTP_HOST'] ?? ''));
        if ($requestHost === '' || !in_array($requestHost, $allowedHosts, true)) {
            self::rejectRequest('Invalid or unrecognized Host header.', 400);
        }

        if (self::isSecureRequest($auth)) {
            return;
        }

        $origin = is_string($auth['origin'] ?? null) ? rtrim($auth['origin'], '/') : '';
        if ($origin === '') {
            self::rejectRequest('HTTPS origin is not configured.', 500);
        }

        header('Location: ' . $origin . self::validatedRequestTarget(), true, 308);
        exit;
    }

    /**
     * @param array<string, mixed> $authConfig
     */
    public static function isSecureRequest(array $authConfig): bool
    {
        if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
            return true;
        }

        $remoteAddress = strtolower((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
        $trustedProxies = is_array($authConfig['trusted_proxies'] ?? null)
            ? $authConfig['trusted_proxies']
            : [];
        if ($remoteAddress === '' || !in_array($remoteAddress, $trustedProxies, true)) {
            return false;
        }

        return strtolower(trim((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))) === 'https';
    }

    public static function configureSession(): void
    {
        if (session_status() !== PHP_SESSION_NONE) {
            return;
        }

        session_name('stammbaum_session');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
    }

    public static function sendSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: same-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
        header('Strict-Transport-Security: max-age=31536000');
        header("Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'");
    }

    /**
     * @return array<string, mixed>
     */
    public static function readJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            self::json(['ok' => false, 'error' => 'Invalid JSON body'], 400);
        }

        if (!is_array($decoded)) {
            self::json(['ok' => false, 'error' => 'JSON body must be an object'], 400);
        }

        return $decoded;
    }

    public static function requireMethod(string $method): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== $method) {
            self::json(['ok' => false, 'error' => 'Method not allowed'], 405);
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private static function requestHostname(string $hostHeader): string
    {
        $hostHeader = trim($hostHeader);
        if ($hostHeader === ''
            || preg_match('/[\x00-\x20\x7f,\/\\\\@]/', $hostHeader) === 1
            || preg_match('/^(?<host>[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?)(?::(?<port>\d{1,5}))?$/i', $hostHeader, $matches) !== 1
        ) {
            return '';
        }

        $hostname = strtolower((string) ($matches['host'] ?? ''));
        if (filter_var($hostname, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) === false) {
            return '';
        }

        if (isset($matches['port']) && $matches['port'] !== '') {
            $port = (int) $matches['port'];
            if ($port < 1 || $port > 65535) {
                return '';
            }
        }

        return $hostname;
    }

    private static function validatedRequestTarget(): string
    {
        $target = (string) ($_SERVER['REQUEST_URI'] ?? '/');
        if ($target === '') {
            return '/';
        }

        if ($target[0] !== '/'
            || strncmp($target, '//', 2) === 0
            || preg_match('/[\x00-\x1f\x7f\\\\]/', $target) === 1
        ) {
            self::rejectRequest('Invalid request target.', 400);
        }

        $parts = parse_url($target);
        if (!is_array($parts)
            || isset($parts['scheme'])
            || isset($parts['host'])
            || isset($parts['user'])
            || isset($parts['pass'])
            || isset($parts['fragment'])
        ) {
            self::rejectRequest('Invalid request target.', 400);
        }

        $path = isset($parts['path']) && $parts['path'] !== '' ? $parts['path'] : '/';
        $query = isset($parts['query']) ? '?' . $parts['query'] : '';
        return $path . $query;
    }

    private static function rejectRequest(string $message, int $status): void
    {
        http_response_code($status);
        header('Content-Type: text/plain; charset=utf-8');
        echo $message;
        exit;
    }
}
