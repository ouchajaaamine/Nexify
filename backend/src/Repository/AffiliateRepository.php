<?php

namespace App\Repository;

use App\Entity\Affiliate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Affiliate>
 */
class AffiliateRepository extends ServiceEntityRepository
{
    /**
     * Constructor for AffiliateRepository.
     *
     * Sets up the repository with the manager registry.
     */
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Affiliate::class);
    }

}