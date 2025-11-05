<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\LoginRequest;
use App\State\LoginProcessor;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/login',
            input: LoginRequest::class,
            processor: LoginProcessor::class,
            name: 'login',
            inputFormats: ['json' => ['application/json']],
            outputFormats: ['json' => ['application/json']]
        ),
    ],
    security: 'is_granted("PUBLIC_ACCESS")'
)]
class Login
{
}
