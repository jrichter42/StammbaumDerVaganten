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

        $config = array_replace($defaults, $config);
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

        return $config;
    }
}
