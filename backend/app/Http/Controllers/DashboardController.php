<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function stats(Request $request): JsonResponse
    {
        return response()->json($this->service->stats($request->user()));
    }

    public function activity(Request $request): JsonResponse
    {
        return response()->json($this->service->recentActivity($request->user()));
    }

    public function sessionStats(Request $request, Session $session): JsonResponse
    {
        abort_if($session->user_id !== $request->user()->id, 403);

        return response()->json($this->service->sessionStats($session));
    }

    public function students(Request $request): JsonResponse
    {
        return response()->json($this->service->allStudents($request->user()));
    }

    public function sessionLogs(Request $request, Session $session): JsonResponse
    {
        abort_if($session->user_id !== $request->user()->id, 403);

        $logs = $this->service->sessionLogs($session);

        return response()->json($logs->map(fn ($l) => [
            'id'           => $l->id,
            'student_name' => $l->sessionInstance->student_name,
            'question'     => $l->question,
            'answer'       => $l->answer,
            'block_label'  => $l->blockContext?->bookmark_label,
            'input_mode'   => $l->input_mode,
            'created_at'   => $l->created_at?->toIso8601String(),
        ]));
    }
}
