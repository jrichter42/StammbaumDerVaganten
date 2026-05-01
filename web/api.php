<?php
declare(strict_types=1);

use Stammbaum\Http;

$app = require __DIR__ . '/app/bootstrap.php';

Http::sendSecurityHeaders();

$storage = $app['storage'];
$config = $app['config'];
$version = $app['version'];
$action = $_GET['action'] ?? 'status';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Http::json(['ok' => false, 'error' => 'Method not allowed'], 405);
    }

    switch ($action) {
        case 'status':
            Http::json([
                'ok' => true,
                'app' => [
                    'name' => $config['name'],
                    'version' => $version,
                    'timezone' => $config['timezone'],
                    'show_warnings' => $config['show_warnings'],
                    'warnings' => $config['warnings'] !== [] ? $config['warnings'] : null,
                ],
                'storage' => $storage->status(),
            ]);
            break;

        case 'objects':
            $type = (string) ($_GET['type'] ?? '');
            Http::json([
                'ok' => true,
                'type' => $type,
                'objects' => $storage->listObjects($type),
            ]);
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
