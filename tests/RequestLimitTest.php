<?php
declare(strict_types=1);

/**
 * Smoke test: verify oversized JSON bodies return 413.
 *
 * Usage: php tests/RequestLimitTest.php [base_url]
 *
 * Default base_url: http://localhost:8000
 * Start the dev server first: php -S localhost:8000 -t web/
 */

$baseUrl = $argv[1] ?? 'http://localhost:8000';

function httpPost(string $url, string $payload): array
{
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'ignore_errors' => true,
        ],
    ]);

    $body = @file_get_contents($url, false, $context);
    $statusLine = $http_response_header[0] ?? '';
    $httpCode = 0;
    if (preg_match('/\b(\d{3})\b/', $statusLine, $m)) {
        $httpCode = (int) $m[1];
    }

    $decoded = $body !== false ? json_decode($body, true) : null;

    return ['code' => $httpCode, 'body' => $decoded, 'raw' => $body ?: '(empty)'];
}

function assert413(string $url, string $payload, string $label): void
{
    $result = httpPost($url, $payload);
    $passed = $result['code'] === 413;
    echo ($passed ? 'PASS' : 'FAIL') . ": {$label} (HTTP {$result['code']})\n";
    if (!$passed) {
        echo "  Body: {$result['raw']}\n";
    }
}

function assertNot413(string $url, string $payload, string $label): void
{
    $result = httpPost($url, $payload);
    $passed = $result['code'] !== 413;
    echo ($passed ? 'PASS' : 'FAIL') . ": {$label} (HTTP {$result['code']})\n";
    if (!$passed) {
        echo "  Body: {$result['raw']}\n";
    }
}

echo "=== Request-Body Limit Smoke Tests ===\n\n";

$apiUrl = rtrim($baseUrl, '/') . '/api.php?action=auth-login-verify';

// 1. Payload just under limit (65536 bytes)
$safe = json_encode(['_pad' => str_repeat('A', 65500)]);
assertNot413($apiUrl, $safe, 'Payload ~65500 bytes (under limit, expect non-413)');

// 2. Payload at exact limit
$exact = json_encode(['_pad' => str_repeat('A', 65518)]);
assertNot413($apiUrl, $exact, 'Payload ~65518 bytes (at limit, expect non-413)');

// 3. Payload exceeding limit
$large = json_encode(['_pad' => str_repeat('A', 70000)]);
assert413($apiUrl, $large, 'Payload ~70000 bytes (over limit, expect 413)');

// 4. Payload with Content-Length exceeding limit (trimmed body)
$headerLarge = json_encode(['_pad' => str_repeat('A', 66000)]);
assert413($apiUrl, $headerLarge, 'Payload ~66000 bytes (over limit, expect 413)');

// 5. Empty JSON object (valid body, should not 413)
$result = httpPost($apiUrl, '{}');
$passed = $result['code'] !== 413;
echo ($passed ? 'PASS' : 'FAIL') . ": Empty object (expect non-413, got HTTP {$result['code']})\n";

echo "\nDone. Over-limit payloads must 413; under-limit and empty must not 413.\n";
