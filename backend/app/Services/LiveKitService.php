<?php

namespace App\Services;

class LiveKitService
{
    /**
     * Room name parsed by the LiveKit agent: session-{session_id}-{instance_id}
     */
    public function roomName(int $sessionId, string|int $instanceId): string
    {
        return "session-{$sessionId}-{$instanceId}";
    }

    /**
     * Generate a LiveKit participant access token (HS256 JWT).
     *
     * Built manually to match LiveKit's exact expected format without
     * any library abstraction that could subtly mis-encode the payload.
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

        $now = time();

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];

        $payload = [
            'iss'   => $apiKey,
            'sub'   => $identity,
            'iat'   => $now,
            'nbf'   => $now,
            'exp'   => $now + 14400, // 4 hours
            'name'  => $displayName,
            'video' => [
                'room'         => $roomName,
                'roomJoin'     => true,
                'canPublish'   => $canPublish,
                'canSubscribe' => $canSubscribe,
            ],
        ];

        $h = $this->b64url(json_encode($header, JSON_UNESCAPED_SLASHES));
        $p = $this->b64url(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $sig = hash_hmac('sha256', "$h.$p", $apiSecret, true);

        return "$h.$p." . $this->b64url($sig);
    }

    private function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
