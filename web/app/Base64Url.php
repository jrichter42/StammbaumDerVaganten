<?php
declare(strict_types=1);

namespace Stammbaum;

use InvalidArgumentException;

final class Base64Url
{
    public static function encode(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    public static function decode(string $value): string
    {
        $value = trim($value);
        if ($value === '' || preg_match('/^[A-Za-z0-9_-]+$/', $value) !== 1) {
            throw new InvalidArgumentException('Invalid base64url value.');
        }

        $padded = strtr($value, '-_', '+/');
        $padding = strlen($padded) % 4;
        if ($padding !== 0) {
            $padded .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode($padded, true);
        if ($decoded === false) {
            throw new InvalidArgumentException('Invalid base64url value.');
        }

        return $decoded;
    }
}
