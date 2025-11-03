<?php

namespace App\Tests\Unit\Service;

use PHPUnit\Framework\TestCase;
use App\Service\ChatbotService;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Doctrine\ORM\EntityManagerInterface;

class ChatbotServiceTest extends TestCase
{
    public function testGenerateResponseReturnsApiResponseOnSuccess(): void
    {
        $httpClient = $this->createMock(HttpClientInterface::class);
        $parameterBag = $this->createMock(ParameterBagInterface::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $cache = $this->createMock(CacheInterface::class);
        
        $parameterBag->method('get')->willReturnMap([
            ['google_api_key', 'test-token'],
            ['kernel.environment', 'test']
        ]);
        
        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $response->method('toArray')->willReturn([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'LLM answer']
                        ]
                    ]
                ]
            ]
        ]);
        
        $httpClient->method('request')->willReturn($response);
        $cache->method('get')->willReturnCallback(fn($k, $cb) => $cb());

        $service = new ChatbotService($httpClient, $parameterBag, $entityManager, $cache);
        $result = $service->generateResponse('hello', null);
        
        $this->assertSame('LLM answer', $result);
    }

    public function testBuildPromptIncludesCampaignContext(): void
    {
        $httpClient = $this->createMock(HttpClientInterface::class);
        $parameterBag = $this->createMock(ParameterBagInterface::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $cache = $this->createMock(CacheInterface::class);
        
        $parameterBag->method('get')->willReturnMap([
            ['google_api_key', 'test-token'],
            ['kernel.environment', 'test']
        ]);

        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $response->method('toArray')->willReturn([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'ok']
                        ]
                    ]
                ]
            ]
        ]);
        
        $httpClient->method('request')->willReturnCallback(function($method, $url, $options) use ($response) {
            $prompt = $options['json']['contents'][0]['parts'][0]['text'] ?? '';
            if (strpos($prompt, 'Spring Sale') === false || strpos($prompt, 'current_metrics') === false) {
                throw new \Exception('Prompt did not include campaign context');
            }
            return $response;
        });
        
        $cache->method('get')->willReturnCallback(fn($k, $cb) => $cb());

        $service = new ChatbotService($httpClient, $parameterBag, $entityManager, $cache);

        $campaignContext = [
            'campaign_id' => 1,
            'name' => 'Spring Sale',
            'budget' => '5000.00',
            'current_metrics' => ['clicks' => 123]
        ];

        $result = $service->generateResponse('how can I improve', $campaignContext);

        $this->assertSame('ok', $result);
    }
}
