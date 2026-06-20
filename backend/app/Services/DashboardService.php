<?php

namespace App\Services;

use App\Models\QaLog;
use App\Models\Session;
use App\Models\SessionInstance;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DashboardService
{
    public function stats(User $user): array
    {
        $sessionIds = $user->sessions()->pluck('id');

        $totalStudents = SessionInstance::whereIn('session_id', $sessionIds)->count();

        $questionsAsked = QaLog::whereHas(
            'sessionInstance',
            fn ($q) => $q->whereIn('session_id', $sessionIds)
        )->count();

        $allJoins = $totalStudents;
        $allCompletions = SessionInstance::whereIn('session_id', $sessionIds)
            ->whereNotNull('completed_at')
            ->count();

        $retentionPct = $allJoins > 0 ? (int) round(($allCompletions / $allJoins) * 100) : null;

        $completedInstances = SessionInstance::whereIn('session_id', $sessionIds)
            ->whereNotNull('completed_at')
            ->get(['started_at', 'completed_at']);

        $avgDurationMins = $completedInstances->isNotEmpty()
            ? (int) round($completedInstances->avg(
                fn ($i) => $i->completed_at->diffInMinutes($i->started_at)
            ))
            : null;

        return [
            'total_sessions'      => $sessionIds->count(),
            'total_students'      => $totalStudents,
            'questions_asked'     => $questionsAsked,
            'avg_duration_mins'   => $avgDurationMins,
            'overall_retention_pct' => $retentionPct,
        ];
    }

    public function sessionStats(Session $session): array
    {
        $joins          = $session->instances()->count();
        $completions    = $session->instances()->whereNotNull('completed_at')->count();
        $uniqueStudents = $session->instances()->distinct('student_name')->count('student_name');

        $questions = QaLog::whereHas(
            'sessionInstance',
            fn ($q) => $q->where('session_id', $session->id)
        )->count();

        $mostAsked = QaLog::whereHas(
            'sessionInstance',
            fn ($q) => $q->where('session_id', $session->id)
        )
            ->whereNotNull('block_context_id')
            ->selectRaw('block_context_id, count(*) as cnt')
            ->groupBy('block_context_id')
            ->orderByDesc('cnt')
            ->with('blockContext:id,bookmark_label,order')
            ->first();

        $avgCompletion = $joins > 0 ? (int) round(($completions / $joins) * 100) : 0;

        return [
            'total_joins'             => $joins,
            'unique_students'         => $uniqueStudents,
            'total_completions'       => $completions,
            'questions_asked'         => $questions,
            'avg_completion_pct'      => $avgCompletion,
            'most_asked_block_label'  => $mostAsked?->blockContext?->bookmark_label,
            'most_asked_block_order'  => $mostAsked?->blockContext?->order,
        ];
    }

    public function sessionLogs(Session $session, int $limit = 20): Collection
    {
        return QaLog::whereHas(
            'sessionInstance',
            fn ($q) => $q->where('session_id', $session->id)
        )
            ->with(['sessionInstance:id,student_name', 'blockContext:id,bookmark_label'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function allStudents(User $user): array
    {
        $sessionIds = $user->sessions()->pluck('id');

        return SessionInstance::whereIn('session_id', $sessionIds)
            ->with('session:id,name')
            ->orderByDesc('started_at')
            ->get()
            ->map(fn ($i) => [
                'id'           => $i->id,
                'student_name' => $i->student_name,
                'session_id'   => $i->session_id,
                'session_name' => $i->session->name,
                'started_at'   => $i->started_at?->toIso8601String(),
                'completed_at' => $i->completed_at?->toIso8601String(),
            ])
            ->toArray();
    }

    public function recentActivity(User $user, int $limit = 10): array
    {
        $sessionIds = $user->sessions()->pluck('id');

        $questions = QaLog::whereHas(
            'sessionInstance',
            fn ($q) => $q->whereIn('session_id', $sessionIds)
        )
            ->with([
                'sessionInstance:id,student_name,session_id',
                'sessionInstance.session:id,name',
            ])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($l) => [
                'type'         => 'question',
                'student_name' => $l->sessionInstance->student_name,
                'session_name' => $l->sessionInstance->session->name,
                'description'  => $l->question,
                'created_at'   => $l->created_at?->toIso8601String(),
            ]);

        $joins = SessionInstance::whereIn('session_id', $sessionIds)
            ->with('session:id,name')
            ->orderByDesc('started_at')
            ->limit($limit)
            ->get()
            ->map(fn ($i) => [
                'type'         => 'join',
                'student_name' => $i->student_name,
                'session_name' => $i->session->name,
                'description'  => null,
                'created_at'   => $i->started_at?->toIso8601String(),
            ]);

        return $questions->concat($joins)
            ->sortByDesc('created_at')
            ->values()
            ->take($limit)
            ->toArray();
    }
}
