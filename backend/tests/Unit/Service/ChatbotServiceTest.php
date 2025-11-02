<?php

namespace App\Tests\Unit\Service;

use PHPUnit\Framework\TestCase;
use App\Service\ChatbotService;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class ChatbotServiceTest extends TestCase
{
    public function testGenerateResponseReturnsApiResponseOnSuccess(): void
    {
        // mocks
        $httpClient = $this->createMock(HttpClientInterface::class);
        $parameterBag = $this->createMock(ParameterBagInterface::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $cache = $this->createMock(CacheInterface::class);
        $logger = $this->createMock(LoggerInterface::class);
        // token
        $parameterBag->method('get')->willReturn('test-token');
        // fake response
        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $response->method('toArray')->willReturn([
            'choices' => [ ['message' => ['content' => 'LLM answer']] ]
        ]);
        $httpClient->method('request')->willReturn($response);
        // cache executes callback
        $cache->method('get')->willReturnCallback(fn($k, $cb) => $cb());

        // act
        $service = new ChatbotService($httpClient, $parameterBag, $entityManager, $cache, $logger);
        $result = $service->generateResponse('hello', null);
        // assert
        $this->assertSame('LLM answer', $result);
    }

    public function testBuildPromptIncludesCampaignContext(): void
    {
        // mocks
        $httpClient = $this->createMock(HttpClientInterface::class);
        $parameterBag = $this->createMock(ParameterBagInterface::class);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $cache = $this->createMock(CacheInterface::class);
        $logger = $this->createMock(LoggerInterface::class);
        $parameterBag->method('get')->willReturn('test-token');

        // fake response 'ok'
        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $response->method('toArray')->willReturn(['choices' => [ ['message' => ['content' => 'ok']] ] ]);
        // check prompt contains campaign info
        $httpClient->method('request')->willReturnCallback(function($method, $url, $options) use ($response) {
            $content = $options['json']['messages'][0]['content'] ?? '';
            // ensure campaign name + metrics
            if (strpos($content, 'Spring Sale') === false || strpos($content, 'current_metrics') === false) {
                throw new \Exception('Prompt did not include campaign context');
            }
            return $response;
        });
        $cache->method('get')->willReturnCallback(fn($k, $cb) => $cb());

        $service = new ChatbotService($httpClient, $parameterBag, $entityManager, $cache, $logger);

        // campaign context
        $campaignContext = [ 'campaign_id' => 1, 'name' => 'Spring Sale', 'budget' => '5000.00', 'current_metrics' => ['clicks'=>123] ];

        $result = $service->generateResponse('how can I improve', $campaignContext);

        // assert
        $this->assertSame('ok', $result);
    }
}
