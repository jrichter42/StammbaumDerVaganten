<?php
declare(strict_types=1);

namespace Stammbaum;

use RuntimeException;

final class Config
{
    /**
     * @return array<string, mixed>
     */
    public static function load(string $path): array
    {
        $defaults = [
            'name' => 'Stammbaum der Vaganten',
            'timezone' => 'UTC',
            'show_warnings' => true,
            'auth' => [],
            'mail' => [
                'enabled' => false,
                'from_address' => '',
                'from_name' => 'Stammbaum der Vaganten',
                'reply_to' => '',
                'login_subject' => 'Login-Link für Stammbaum der Vaganten',
            ],
        ];

        if (!is_file($path)) {
            return $defaults;
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

        $auth = is_array($config['auth'] ?? null) ? $config['auth'] : [];
        $baseUrl = is_string($auth['base_url'] ?? null) ? rtrim(trim($auth['base_url']), '/') : '';
        if ($baseUrl === '' || filter_var($baseUrl, FILTER_VALIDATE_URL) === false) {
            $config['warnings'][] = 'auth.base_url must be set to the public app URL in config/app.json before setup links can be generated.';
        } else {
            $config['auth']['base_url'] = $baseUrl;
        }

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
}
