<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\ChatbotRequest;
use App\Service\ChatbotService;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ChatbotProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ChatbotService $chatbotService
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): array
    {
        if (!$data instanceof ChatbotRequest) {
            throw new \InvalidArgumentException('Expected ChatbotRequest instance');
        }

        $campaignContext = null;
        if ($data->campaignId) {
            $campaignContext = $this->chatbotService->getCampaignContext($data->campaignId);
            if (null === $campaignContext) {
                throw new NotFoundHttpException('Campaign not found');
            }
        }

        $responseContent = $this->chatbotService->generateResponse(
            $data->query,
            $campaignContext
        );

        return ['response' => $responseContent];
    }
}
