<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\LoginRequest;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;

/**
 * @implements ProcessorInterface<LoginRequest, JsonResponse>
 */
class LoginProcessor implements ProcessorInterface
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager,
        private UserPasswordHasherInterface $passwordHasher,
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): JsonResponse
    {
        $request = $data;

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $request->email]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $request->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        $token = $this->jwtManager->create($user);

        return new JsonResponse(['token' => $token], Response::HTTP_OK);
    }
}
