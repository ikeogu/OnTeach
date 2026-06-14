<?php

namespace App\Services;

use App\Models\Session;
use App\Models\SessionInstance;
use Illuminate\Support\Facades\Http;

class StudentSessionService
{
    public function join(Session $session, string $studentName): array
    {
        $instance = SessionInstance::create([
            'session_id'   => $session->id,
            'student_name' => $studentName,
            'started_at'   => now(),
        ]);

        $roomName = 'session-' . $session->id . '-' . $instance->id;
        $identity = 'student-' . $instance->id;

        // Delegate token generation to the ai-service which uses the official
        // livekit-api Python SDK — avoids JWT format mismatches from PHP.
        $aiBase = config('services.ai_service.url', 'http://127.0.0.1:8001');
        $resp = Http::post("{$aiBase}/internal/livekit-token", [
            'room'          => $roomName,
            'identity'      => $identity,
            'name'          => $studentName,
            'can_publish'   => true,
            'can_subscribe' => true,
        ]);

        $resp->throw();
        $data = $resp->json();

        return [
            'session_instance_id' => $instance->id,
            'livekit_url'         => $data['livekit_url'],
            'livekit_token'       => $data['token'],
            'room_name'           => $roomName,
        ];
    }
}
