<?php
declare(strict_types=1);

namespace Stammbaum;

use RuntimeException;

final class Config
{
    public const LOGIN_LINK_TTL_MIN_SECONDS = 60;
    public const LOGIN_LINK_TTL_DEFAULT_SECONDS = 600;
    public const LOGIN_LINK_TTL_MAX_SECONDS = 3600;

    /**
     * @return array<string, mixed>
     */
    public static function load(string $path): array
    {
        $defaults = [
            'name' => 'Stammbaum der Vaganten',
            'timezone' => 'UTC',
            'show_warnings' => true,
            'mail' => [
                'enabled' => false,
                'from_address' => '',
                'from_name' => 'Stammbaum der Vaganten',
                'reply_to' => '',
                'login_subject' => 'Login-Link für Stammbaum der Vaganten',
            ],
        ];

        if (!is_file($path)) {
            throw new RuntimeException(
                'Missing config/app.json. Explicit auth.base_url, auth.origin, auth.rp_id, '
                . 'auth.allowed_hosts, and auth.trusted_proxies configuration is required.'
            );
        }

        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new RuntimeException('Could not read config file.');
        }

        try {
            $config = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new RuntimeException('Invalid config JSON: ' . $exception->getMessage(), 0, $exception);
        }

        if (!is_array($config)) {
            throw new RuntimeException('Config root must be a JSON object.');
        }

        $config = array_replace_recursive($defaults, $config);
        $config['show_warnings'] = (bool) $config['show_warnings'];
        $config['warnings'] = [];

        if (!is_string($config['timezone']) || !in_array($config['timezone'], timezone_identifiers_list(), true)) {
            $configuredTimezone = is_scalar($config['timezone']) ? (string) $config['timezone'] : gettype($config['timezone']);
            $config['timezone'] = 'UTC';
            $config['warnings'][] = sprintf(
                'Invalid timezone "%s" in config/app.json. Falling back to UTC.',
                $configuredTimezone
            );
        }

        $config['auth'] = self::normalizeAuthConfig($config['auth'] ?? null);

        $mail = is_array($config['mail'] ?? null) ? $config['mail'] : $defaults['mail'];
        $mail['enabled'] = (bool) ($mail['enabled'] ?? false);
        foreach (['from_address', 'from_name', 'reply_to', 'login_subject'] as $key) {
            $mail[$key] = is_string($mail[$key] ?? null)
                ? trim(str_replace(["\r", "\n"], '', $mail[$key]))
                : '';
        }

        if ($mail['login_subject'] === '') {
            $mail['login_subject'] = $defaults['mail']['login_subject'];
        }

        if ($mail['enabled'] && filter_var($mail['from_address'], FILTER_VALIDATE_EMAIL) === false) {
            $config['warnings'][] = 'mail.from_address must be a valid email address before login links can be sent.';
        }

        if ($mail['reply_to'] !== '' && filter_var($mail['reply_to'], FILTER_VALIDATE_EMAIL) === false) {
            $config['warnings'][] = 'mail.reply_to is not a valid email address and will be ignored.';
            $mail['reply_to'] = '';
        }

        $config['mail'] = $mail;

        return $config;
    }

    /**
     * @param array<string, mixed> $config
     */
    public static function loginLinkTtlSeconds(array $config): int
    {
        $auth = is_array($config['auth'] ?? null) ? $config['auth'] : [];
        $value = $auth['login_link_ttl_seconds'] ?? self::LOGIN_LINK_TTL_DEFAULT_SECONDS;
        if (!is_int($value) && !(is_string($value) && preg_match('/^\d+$/', $value) === 1)) {
            throw new RuntimeException('auth.login_link_ttl_seconds must be an integer.');
        }

        return max(
            self::LOGIN_LINK_TTL_MIN_SECONDS,
            min(self::LOGIN_LINK_TTL_MAX_SECONDS, (int) $value)
        );
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>
     */
    private static function normalizeAuthConfig($value): array
    {
        if (!is_array($value)) {
            throw new RuntimeException('auth must be a JSON object in config/app.json.');
        }

        $required = [
            'base_url',
            'origin',
            'rp_id',
            'allowed_hosts',
            'trusted_proxies',
            'login_link_ttl_seconds',
            'initial_admin_username',
        ];
        $missing = array_values(array_filter(
            $required,
            static fn (string $key): bool => !array_key_exists($key, $value)
        ));
        if ($missing !== []) {
            throw new RuntimeException('Missing required auth configuration: auth.' . implode(', auth.', $missing) . '.');
        }

        $baseUrl = self::normalizeHttpsUrl($value['base_url'], 'auth.base_url', false);
        $origin = self::normalizeHttpsUrl($value['origin'], 'auth.origin', true);
        $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
        $rpId = self::normalizeHostname($value['rp_id'], 'auth.rp_id');
        $allowedHosts = self::normalizeHostnames($value['allowed_hosts'], 'auth.allowed_hosts');
        if (!in_array($originHost, $allowedHosts, true)) {
            throw new RuntimeException('auth.allowed_hosts must include the auth.origin hostname "' . $originHost . '".');
        }

        if (!is_array($value['trusted_proxies']) || !self::isList($value['trusted_proxies'])) {
            throw new RuntimeException('auth.trusted_proxies must be a JSON array of literal IP addresses.');
        }
        $trustedProxies = [];
        foreach ($value['trusted_proxies'] as $proxy) {
            if (!is_string($proxy) || filter_var(trim($proxy), FILTER_VALIDATE_IP) === false) {
                throw new RuntimeException('auth.trusted_proxies may contain only literal IPv4 or IPv6 addresses.');
            }
            $trustedProxies[] = strtolower(trim($proxy));
        }

        $username = is_string($value['initial_admin_username']) ? trim($value['initial_admin_username']) : '';
        if ($username === '') {
            throw new RuntimeException('auth.initial_admin_username must be a non-empty string.');
        }

        return array_replace($value, [
            'base_url' => $baseUrl,
            'origin' => $origin,
            'rp_id' => $rpId,
            'allowed_hosts' => array_values(array_unique($allowedHosts)),
            'trusted_proxies' => array_values(array_unique($trustedProxies)),
            'login_link_ttl_seconds' => self::loginLinkTtlSeconds(['auth' => $value]),
            'initial_admin_username' => $username,
        ]);
    }

    /**
     * @param mixed $value
     */
    private static function normalizeHttpsUrl($value, string $field, bool $originOnly): string
    {
        $url = is_string($value) ? rtrim(trim($value), '/') : '';
        if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {
            throw new RuntimeException($field . ' must be a valid HTTPS URL.');
        }

        $parts = parse_url($url);
        if (!is_array($parts)
            || strtolower((string) ($parts['scheme'] ?? '')) !== 'https'
            || !isset($parts['host'])
            || isset($parts['user'])
            || isset($parts['pass'])
            || isset($parts['query'])
            || isset($parts['fragment'])
        ) {
            throw new RuntimeException($field . ' must be a valid HTTPS URL without credentials, query, or fragment.');
        }

        $hostname = self::normalizeHostname($parts['host'], $field . ' hostname');
        if ($originOnly && isset($parts['path']) && $parts['path'] !== '') {
            throw new RuntimeException($field . ' must contain only an HTTPS scheme, hostname, and optional port.');
        }

        $port = isset($parts['port']) && (int) $parts['port'] !== 443 ? ':' . (int) $parts['port'] : '';
        $path = !$originOnly && isset($parts['path']) ? $parts['path'] : '';
        return 'https://' . $hostname . $port . $path;
    }

    /**
     * @param mixed $value
     */
    private static function normalizeHostname($value, string $field): string
    {
        $hostname = is_string($value) ? strtolower(trim($value)) : '';
        if ($hostname === ''
            || filter_var($hostname, FILTER_VALIDATE_IP) !== false
            || filter_var($hostname, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME) === false
        ) {
            throw new RuntimeException($field . ' must be a valid hostname.');
        }

        return $hostname;
    }

    /**
     * @param mixed $value
     * @return array<int, string>
     */
    private static function normalizeHostnames($value, string $field): array
    {
        if (!is_array($value) || !self::isList($value) || $value === []) {
            throw new RuntimeException($field . ' must be a non-empty JSON array of hostnames.');
        }

        return array_map(
            static fn ($hostname): string => self::normalizeHostname($hostname, $field . ' entry'),
            $value
        );
    }

    /**
     * @param array<mixed> $value
     */
    private static function isList(array $value): bool
    {
        return $value === [] || array_keys($value) === range(0, count($value) - 1);
    }
}
