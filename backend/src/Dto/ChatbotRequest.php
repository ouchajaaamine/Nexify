<?php

namespace App\Dto;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

final class ChatbotRequest
{
    #[Groups(['chatbot:write'])]
    #[Assert\NotBlank(message: 'Query cannot be empty')]
    #[Assert\Length(
        min: 1,
        max: 1000,
        minMessage: 'Query must be at least {{ limit }} characters long',
        maxMessage: 'Query cannot be longer than {{ limit }} characters'
    )]
    public string $query = '';

    #[Groups(['chatbot:write'])]
    #[Assert\Positive(message: 'Campaign ID must be a positive number')]
    public ?int $campaignId = null;
}