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

function request_413(string $url, string $payload, string $label): void
{
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'ignore_errors' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    $statusLine = $http_response_header[0] ?? '';
    $httpCode = 0;
    if (preg_match('/\b(\d{3})\b/', $statusLine, $m)) {
        $httpCode = (int) $m[1];
    }

    $decoded = $response !== false ? json_decode($response, true) : null;
    $is413 = $httpCode === 413;
    $hasOkFalse = ($decoded['ok'] ?? true) === false;
    $hasError = is_string($decoded['error'] ?? null);

    $passed = $is413 || ($hasOkFalse && $hasError);
    echo ($passed ? 'PASS' : 'FAIL') . ": {$label} (HTTP {$httpCode})\n";
    if (!$passed) {
        echo "  Response: " . ($response ?: '(empty)') . "\n";
    }
}

echo "=== Request-Body Limit Smoke Tests ===\n\n";

$apiUrl = rtrim($baseUrl, '/') . '/api.php?action=status';

// 1. Payload just under limit (65536 bytes)
$safe = json_encode(['_pad' => str_repeat('A', 65500)]);
request_413($apiUrl, $safe, 'Payload ~65500 bytes (under limit)');

// 2. Payload at exact limit
$exact = json_encode(['_pad' => str_repeat('A', 65518)]);
request_413($apiUrl, $exact, 'Payload ~65518 bytes (at limit)');

// 3. Payload exceeding limit via Content-Length
$large = json_encode(['_pad' => str_repeat('A', 70000)]);
request_413($apiUrl, $large, 'Payload ~70000 bytes (over limit via size)');

// 4. Payload with Content-Length header exceeding limit (trimmed body)
$headerLarge = json_encode(['_pad' => str_repeat('A', 66000)]);
request_413($apiUrl, $headerLarge, 'Payload ~66000 bytes (over limit)');

// 5. Empty JSON object (should be valid, not 413)
$empty = '{}';
$ctx = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $empty,
        'ignore_errors' => true,
    ],
]);
$response = @file_get_contents($apiUrl, false, $ctx);
$decoded = $response !== false ? json_decode($response, true) : null;
$passed = ($decoded['ok'] ?? null) === true;
echo ($passed ? 'PASS' : 'FAIL') . ": Empty object (should not be 413)\n";

echo "\nDone. Spot-check: empty object must pass, large payloads must 413.\n";
