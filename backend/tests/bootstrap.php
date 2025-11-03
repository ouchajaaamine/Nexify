        <?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

// Simple, resilient env bootstrap for CI and local runs:
// - If .env exists, load it as usual
// - Otherwise, default to APP_ENV=test and APP_DEBUG=1 without failing
$envFile = dirname(__DIR__).'/.env';
// Only attempt to load .env when it is a regular, readable file to avoid CI errors
if (method_exists(Dotenv::class, 'bootEnv') && is_file($envFile) && is_readable($envFile)) {
    (new Dotenv())->bootEnv($envFile);
} else {
    $appEnv = getenv('APP_ENV') ?: 'test';
    $appDebug = getenv('APP_DEBUG');
    if ($appDebug === false) {
        $appDebug = '1';
    }
    $_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = $appEnv;
    $_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] = $appDebug;
}

if (!empty($_SERVER['APP_DEBUG'])) {
    umask(0000);
}
