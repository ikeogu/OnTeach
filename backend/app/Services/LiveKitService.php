<?php

namespace App\Services;

use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;

class LiveKitService
{
    /**
     * Room name convention: session-{session_id}-{instance_id}
     * The LiveKit Agent parses this to know which session to orchestrate.
     */
    public function roomName(int $sessionId, string|int $instanceId): string
    {
        return "session-{$sessionId}-{$instanceId}";
    }

    /**
     * Generate a LiveKit participant access token (JWT).
     * Signed with HMAC-SHA256 using the API secret.
     */
    public function participantToken(
        string $roomName,
        string $identity,
        string $displayName,
        bool $canPublish = true,
        bool $canSubscribe = true,
    ): string {
        $apiKey    = config('services.livekit.api_key');
        $apiSecret = config('services.livekit.api_secret');

        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($apiSecret)
        );

        $now = new \DateTimeImmutable();

        // LiveKit reads grants from the "video" claim
        $grants = [
            'roomJoin'    => true,
            'room'        => $roomName,
            'canPublish'  => $canPublish,
            'canSubscribe'=> $canSubscribe,
        ];

        $token = $config->builder()
            ->issuedBy($apiKey)
            ->relatedTo($identity)
            ->issuedAt($now)
            ->canOnlyBeUsedAfter($now)
            ->expiresAt($now->modify('+4 hours'))
            ->withClaim('video', $grants)
            ->withClaim('name', $displayName)
            ->getToken($config->signer(), $config->signingKey());

        return $token->toString();
    }
}
