<?php

namespace App\Services;

use App\Models\Session;
use App\Models\SessionInstance;

class StudentSessionService
{
    public function __construct(private LiveKitService $liveKit) {}

    public function join(Session $session, string $studentName): array
    {
        $instance = SessionInstance::create([
            'session_id'   => $session->id,
            'student_name' => $studentName,
            'started_at'   => now(),
        ]);

        $roomName = $this->liveKit->roomName($session->id, $instance->id);
        $identity = 'student-' . $instance->id;

        $token = $this->liveKit->participantToken(
            roomName:    $roomName,
            identity:    $identity,
            displayName: $studentName,
        );

        return [
            'session_instance_id' => $instance->id,
            'livekit_url'         => config('services.livekit.url'),
            'livekit_token'       => $token,
            'room_name'           => $roomName,
        ];
    }
}
