<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

$projectDir = dirname(__DIR__);
$envTest = $projectDir.'/.env.test';

if (class_exists(Dotenv::class) && is_file($envTest) && is_readable($envTest)) {
    try {
        (new Dotenv())->load($envTest);
    } catch (\Throwable $e) {
    }
}

if (!isset($_SERVER['APP_ENV']) && !isset($_ENV['APP_ENV'])) {
    $_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = getenv('APP_ENV') ?: 'test';
}

if (!isset($_SERVER['APP_DEBUG']) && !isset($_ENV['APP_DEBUG'])) {
    $appDebug = getenv('APP_DEBUG');
    if ($appDebug === false) {
        $appDebug = '1';
    }
    $_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] = $appDebug;
}

if (!empty($_SERVER['APP_DEBUG'])) {
    umask(0000);
}
