<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Dto\ChatbotRequest;
use App\State\ChatbotProcessor;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/chatbot/query',
            input: ChatbotRequest::class,
            processor: ChatbotProcessor::class,
            normalizationContext: ['groups' => ['chatbot:read']],
            denormalizationContext: ['groups' => ['chatbot:write']],
            security: "is_granted('IS_AUTHENTICATED_FULLY')",
            name: 'chatbot_query'
        ),
    ],
    normalizationContext: ['groups' => ['chatbot:read']],
    denormalizationContext: ['groups' => ['chatbot:write']]
)]
class Chatbot
{
    
}