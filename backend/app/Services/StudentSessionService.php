<?php

namespace App\Services;

use App\Models\Session;
use App\Models\SessionInstance;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;

class StudentSessionService
{
    public function join(Session $session, string $studentName): array
    {
        $instance = SessionInstance::create([
            'session_id' => $session->id,
            'student_name' => $studentName,
            'started_at' => now(),
        ]);

        $token = $this->mintStudentJwt($session, $instance);

        return [
            'session_instance_id' => $instance->id,
            'ws_url' => config('services.ai_service.ws_url') . '/session/' . $instance->id,
            'student_token' => $token,
        ];
    }

    private function mintStudentJwt(Session $session, SessionInstance $instance): string
    {
        $secret = config('services.ai_service.jwt_secret');
        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($secret)
        );

        $token = $config->builder()
            ->issuedAt(new \DateTimeImmutable())
            ->expiresAt((new \DateTimeImmutable())->modify('+4 hours'))
            ->withClaim('session_id', $session->id)
            ->withClaim('session_instance_id', $instance->id)
            ->withClaim('student_name', $instance->student_name)
            ->getToken($config->signer(), $config->signingKey());

        return $token->toString();
    }
}
