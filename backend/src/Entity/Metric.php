<?php

namespace App\Entity;

use App\Repository\MetricRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\MaxDepth;

#[ApiResource(
    security: "is_granted('IS_AUTHENTICATED_FULLY')",
    normalizationContext: ['groups' => ['metric:read']],
    denormalizationContext: ['groups' => ['metric:write']],
)]
#[ApiFilter(SearchFilter::class, properties: ['notes' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['timestamp' => 'DESC', 'createdAt' => 'DESC'], arguments: ['orderParameterName' => 'order'])]
#[ORM\Entity(repositoryClass: MetricRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Metric
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['metric:read', 'campaign:read:full'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?string $value = '0.00';

    #[ORM\Column(nullable: true)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?int $clicks = 0;

    #[ORM\Column(nullable: true)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?int $conversions = 0;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?string $revenue = '0.00';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?string $notes = null;

    #[ORM\Column]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    private ?\DateTimeImmutable $timestamp = null;

    #[ORM\ManyToOne(inversedBy: 'metrics')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['metric:read', 'metric:write', 'campaign:read:full'])]
    #[MaxDepth(1)]
    private ?Campaign $campaign = null;

    #[ORM\Column]
    #[Groups(['metric:read', 'campaign:read:full'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['metric:read', 'campaign:read:full'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[Groups(['metric:read'])]
    public function getCampaignId(): ?int
    {
        return $this->campaign?->getId();
    }

    #[Groups(['metric:read'])]
    public function getDate(): ?string
    {
        return $this->timestamp?->format('Y-m-d\TH:i:s.v\Z');
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    public function getClicks(): ?int
    {
        return $this->clicks;
    }

    public function setClicks(int $clicks): static
    {
        $this->clicks = $clicks;

        return $this;
    }

    public function getConversions(): ?int
    {
        return $this->conversions;
    }

    public function setConversions(int $conversions): static
    {
        $this->conversions = $conversions;

        return $this;
    }

    public function getRevenue(): ?string
    {
        return $this->revenue;
    }

    public function setRevenue(string $revenue): static
    {
        $this->revenue = $revenue;

        return $this;
    }

    public function getTimestamp(): ?\DateTimeImmutable
    {
        return $this->timestamp;
    }

    public function setTimestamp(\DateTimeImmutable $timestamp): static
    {
        $this->timestamp = $timestamp;

        return $this;
    }

    public function getCampaign(): ?Campaign
    {
        return $this->campaign;
    }

    public function setCampaign(?Campaign $campaign): static
    {
        if ($this->campaign === $campaign) {
            return $this;
        }

        if ($this->campaign !== null) {
            $old = $this->campaign;
            $this->campaign = null;
            $old->removeMetric($this);
        }

        $this->campaign = $campaign;

        if ($campaign !== null && !$campaign->getMetrics()->contains($this)) {
            $campaign->addMetric($this);
        }

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAt(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function setUpdatedAt(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function recalculateNexifyggregates(): void
    {
        $this->campaign?->calculateRevenueAndRoi();
    }
}