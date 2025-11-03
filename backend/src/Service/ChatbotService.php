<?php

namespace App\Service;

use App\Entity\Campaign;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatbotService
{
    private const CACHE_VERSION = '2';
    private HttpClientInterface $httpClient;
    private string $googleApiKey;
    private EntityManagerInterface $entityManager;
    private CacheInterface $cache;
    private string $env;

    public function __construct(
        HttpClientInterface $httpClient,
        ParameterBagInterface $parameterBag,
        EntityManagerInterface $entityManager,
        CacheInterface $cache
    ) {
        $this->httpClient = $httpClient;
        $this->googleApiKey = (string) $parameterBag->get('google_api_key');
    $this->entityManager = $entityManager;
    $this->cache = $cache;
    $this->env = (string) $parameterBag->get('kernel.environment');
    }

    /**
     * @param string $query
     * @param array<string,mixed>|null $campaignContext
     * @return string
     */
    public function generateResponse(string $query, ?array $campaignContext = null): string
    {
        $campaignId = $campaignContext['campaign_id'] ?? null;
    $cacheKey = 'chatbot_response_v' . self::CACHE_VERSION . '_' . md5($query . '|' . ($campaignId ?? 'none'));

        try {
            return $this->cache->get($cacheKey, function(ItemInterface $item) use ($query, $campaignContext) {
                $item->expiresAfter(600);
                $prompt = $this->buildPrompt($query, $campaignContext);
                return $this->callGeminiAPI($prompt);
            });
        } catch (\Exception $e) {
            return $this->generateFallbackResponse($query, $campaignContext, $e->getMessage());
        }
    }

    /**
     * @param string $query
     * @param array<string,mixed>|null $campaignContext
     * @return string
     */
    private function buildPrompt(string $query, ?array $campaignContext = null): string
    {
        $basePrompt = "You are an AI assistant specializing in advertising campaign management and ROI analysis. ";

        if ($campaignContext) {
            $basePrompt .= "You have access to the following campaign data:\\n";
            $basePrompt .= json_encode($campaignContext, JSON_PRETTY_PRINT) . "\\n\\n";
            $basePrompt .= "Use this data to provide personalized, data-driven advice.\\n\\n";
        }

        $basePrompt .= "User query: {$query}\\n\\n";
        $basePrompt .= "Please provide a helpful, professional response:";

        return $basePrompt;
    }

    /**
     * @param string $prompt
     * @return string
     * @throws \Exception
     */
    private function callGeminiAPI(string $prompt): string
    {
        $base = 'https://generativelanguage.googleapis.com';

        $availableModels = $this->discoverModels();

        $preferredOrder = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
        ];

        $ordered = [];
        foreach ($preferredOrder as $m) {
            if (in_array($m, $availableModels, true)) {
                $ordered[] = $m;
            }
        }
        foreach ($availableModels as $m) {
            if (!in_array($m, $ordered, true)) {
                $ordered[] = $m;
            }
        }

        if (!$ordered) {
            $ordered = [
                'gemini-2.5-flash',
                'gemini-2.5-pro',
                'gemini-2.0-flash',
                'gemini-2.0-flash-lite',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-1.0-pro',
            ];
        }

        $lastException = null;
        foreach ($ordered as $model) {
            foreach (['v1', 'v1beta'] as $version) {
                $url = sprintf('%s/%s/models/%s:generateContent', $base, $version, $model);
                try {
                    return $this->doGeminiRequest($url, $prompt, sprintf('%s/%s', $version, $model));
                } catch (\Throwable $e) {
                    $lastException = $e;
                }
            }
        }

        // Avoid nullsafe/?? on a variable PHPStan may consider non-nullable.
        $lastMessage = 'No endpoints available';
        if ($lastException instanceof \Throwable) {
            $lastMessage = $lastException->getMessage();
        }

        throw new \Exception('All Gemini endpoints failed: ' . $lastMessage);
    }

    /**
     * @param string $endpointUrl
     * @param string $prompt
     * @param string $label
     * @return string
     * @throws \Exception
     */
    private function doGeminiRequest(string $endpointUrl, string $prompt, string $label): string
    {
        $urlWithKey = $endpointUrl . '?key=' . urlencode($this->googleApiKey);

        $response = $this->httpClient->request('POST', $urlWithKey, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 500,
                ]
            ],
            'timeout' => 30,
        ]);

        $statusCode = $response->getStatusCode();
        if ($statusCode !== 200) {
            $body = $response->getContent(false);
            $err = null;
            $errJson = json_decode($body, true);
            if (isset($errJson['error']['message'])) {
                $err = $errJson['error']['message'];
            }
            $suffix = $err ? (" - " . $err) : '';
            throw new \Exception("Gemini API error ({$statusCode}) at {$label}{$suffix}");
        }

        $data = $response->toArray(false);

        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            return trim($data['candidates'][0]['content']['parts'][0]['text']);
        }

        if (isset($data['candidates'][0]['content']['parts']) && is_array($data['candidates'][0]['content']['parts'])) {
            $texts = array_map(static fn($p) => $p['text'] ?? '', $data['candidates'][0]['content']['parts']);
            $combined = trim(implode("\n", array_filter($texts)));
            if ($combined !== '') {
                return $combined;
            }
        }

        throw new \Exception('Unexpected response format from Google Gemini API');
    }

    /**
     * @return string[]
     */
    private function discoverModels(): array
    {
        $url = 'https://generativelanguage.googleapis.com/v1/models?key=' . urlencode($this->googleApiKey);
        try {
            $response = $this->httpClient->request('GET', $url, [
                'headers' => [
                    'Accept' => 'application/json',
                ],
                'timeout' => 15,
            ]);
            if ($response->getStatusCode() !== 200) {
                return [];
            }
            $data = $response->toArray(false);
            $models = [];
            foreach (($data['models'] ?? []) as $m) {
                $name = $m['name'] ?? '';
                if (!is_string($name) || $name === '') {
                    continue;
                }
                $id = str_starts_with($name, 'models/') ? substr($name, 7) : $name;
                $methods = $m['supportedGenerationMethods'] ?? [];
                if (is_array($methods) && in_array('generateContent', $methods, true)) {
                    $models[] = $id;
                }
            }
            return $models;
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * @param int $campaignId
     * @return array<string,mixed>|null
     */
    public function getCampaignContext(int $campaignId): ?array
    {
        $cacheKey = "chatbot_campaign_{$campaignId}";

        try {
            return $this->cache->get($cacheKey, function() use ($campaignId) {

                $campaign = $this->entityManager->getRepository(Campaign::class)->find($campaignId);

                if (!$campaign) {
                    return null;
                }

                $metrics = $campaign->getMetrics();
                $totalClicks = 0;
                $totalConversions = 0;
                $totalRevenue = 0.0;
                $totalSpent = 0.0;

                foreach ($metrics as $metric) {
                    $metricName = strtolower($metric->getName());
                    $metricValue = (float) $metric->getValue();

                    if (strpos($metricName, 'views') !== false || strpos($metricName, 'searches') !== false || strpos($metricName, 'clicks') !== false || strpos($metricName, 'impressions') !== false) {
                        $totalClicks += $metricValue;
                    } elseif (strpos($metricName, 'sales') !== false || strpos($metricName, 'orders') !== false || strpos($metricName, 'conversions') !== false || strpos($metricName, 'purchases') !== false) {
                        $totalConversions += $metricValue;
                    } elseif (strpos($metricName, 'revenue') !== false || strpos($metricName, 'income') !== false) {
                        $totalRevenue += $metricValue;
                    } elseif (strpos($metricName, 'cost') !== false || strpos($metricName, 'spend') !== false || strpos($metricName, 'spent') !== false) {
                        $totalSpent += $metricValue;
                    }
                }

                $roi = $totalSpent > 0 ? (($totalRevenue - $totalSpent) / $totalSpent) * 100 : 0;

                $affiliateNames = [];
                foreach ($campaign->getAffiliates() as $affiliate) {
                    $affiliateNames[] = $affiliate->getName();
                }

                $context = [
                    'campaign_id' => $campaign->getId(),
                    'name' => $campaign->getName(),
                    'budget' => $campaign->getBudget(),
                    'status' => $campaign->getStatus(),
                    'affiliates' => $affiliateNames,
                    'current_metrics' => [
                        'clicks' => $totalClicks,
                        'conversions' => $totalConversions,
                        'revenue' => $totalRevenue,
                        'cost' => $totalSpent,
                    ],
                    'roi_calculation' => [
                        'total_spent' => $totalSpent,
                        'total_revenue' => $totalRevenue,
                        'roi_percentage' => round($roi, 2),
                        'status' => $roi >= 0 ? 'profit' : 'loss',
                    ],
                ];

                return $context;
            });

        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * @param string $query
     * @param array<string,mixed>|null $campaignContext
     * @param string|null $debug
     * @return string
     */
    private function generateFallbackResponse(string $query, ?array $campaignContext = null, ?string $debug = null): string
    {
        $suffix = '';
        $isDev = ($this->env !== 'prod');
        if ($debug && $isDev) {
            $suffix = ' (AI error: ' . $debug . ')';
        }
        if ($campaignContext) {
            $campaignName = $campaignContext['name'] ?? 'your campaign';
            $budget = $campaignContext['budget'] ?? 0;
            $metrics = $campaignContext['current_metrics'] ?? [];
            $roi = $campaignContext['roi_calculation']['roi_percentage'] ?? 0;
            
            return "I apologize, but I'm currently unable to access the AI service. However, based on your **{$campaignName}** campaign data (Budget: $" . number_format($budget, 2) . ", ROI: " . number_format($roi, 2) . "%), I can see you have active performance metrics. Please try your question again in a moment, or contact support if the issue persists." . $suffix;
        }
        
        return "I apologize, but I'm currently unable to process your request due to a technical issue. Please try again in a moment." . $suffix;
    }
}