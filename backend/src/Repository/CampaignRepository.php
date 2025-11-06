<?php

namespace App\Repository;

use App\Entity\Campaign;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Campaign>
 */
class CampaignRepository extends ServiceEntityRepository
{
    /**
     * Constructor for CampaignRepository.
     *
     * Sets up the repository with the manager registry.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Campaign::class);
    }

    /**
     * Get the total revenue for a campaign by its ID.
     *
     * It sums up the revenue from metrics, or uses the value if revenue is not set.
     *
     * @param int $campaignId The ID of the campaign.
     * @return float The total revenue as a float.
     */
    public function getTotalRevenueByCampaignId(int $campaignId): float
    {
        return $this->createQueryBuilder('c')
            ->select('SUM(CASE WHEN m.revenue IS NOT NULL AND m.revenue != 0 THEN m.revenue ELSE m.value END)')
            ->leftJoin('c.metrics', 'm')
            ->andWhere('c.id = :campaignId')
            ->setParameter('campaignId', $campaignId)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
