<?php
declare(strict_types=1);

use Stammbaum\Config;
use Stammbaum\Http;
use Stammbaum\Storage;

define('STAMMBAUM_BASE_PATH', dirname(__DIR__));
define('STAMMBAUM_VERSION', '0.1.0');

spl_autoload_register(static function (string $class): void {
    $prefix = 'Stammbaum\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) {
        require $path;
    }
});

$config = Config::load(STAMMBAUM_BASE_PATH . '/config/app.json');

date_default_timezone_set('UTC');
error_reporting(E_ALL);
ini_set('display_errors', '0');

Http::configureSession();

$storage = new Storage(STAMMBAUM_BASE_PATH);
$storage->ensureStructure();

return [
    'config' => $config,
    'storage' => $storage,
    'version' => STAMMBAUM_VERSION,
];
