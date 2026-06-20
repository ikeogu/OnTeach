<?php

namespace App\Http\Controllers;

use App\Models\QaLog;
use App\Models\Session;
use App\Models\SessionInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalSessionController extends Controller
{
    /** Called by FastAPI orchestrator on WS connect to load blocks + avatar config. */
    public function playerData(Session $session): JsonResponse
    {
        $session->load(['blocks' => fn ($q) => $q->orderBy('order'), 'user']);

        return response()->json([
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'avatar_id' => $session->avatar_id,
                'voice_id' => $session->voice_id,
                'background' => $session->background,
                'cover_image_url' => $session->cover_image_url,
            ],
            'creator' => [
                'name' => $session->user->name,
            ],
            'blocks' => $session->blocks->map(fn ($b) => [
                'id' => $b->id,
                'order' => $b->order,
                'type' => $b->type,
                'payload' => $b->payload,
                'bookmark_label' => $b->bookmark_label,
            ])->values(),
        ]);
    }

    /** Called by the LiveKit agent when all blocks have been played. */
    public function complete(Request $request, Session $session): JsonResponse
    {
        $data = $request->validate([
            'session_instance_id' => ['required', 'string'],
        ]);

        SessionInstance::where('id', $data['session_instance_id'])
            ->whereNull('completed_at')
            ->update(['completed_at' => now()]);

        return response()->json(['ok' => true]);
    }

    /** Called by FastAPI after each RAG Q&A to persist the qa_log record. */
    public function logQA(Request $request, Session $session): JsonResponse
    {
        $data = $request->validate([
            'session_instance_id' => ['required', 'string'],
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
            'block_context_id' => ['nullable', 'integer'],
            'input_mode' => ['nullable', 'in:text,voice'],
        ]);

        QaLog::create([
            'session_instance_id' => $data['session_instance_id'],
            'question' => $data['question'],
            'answer' => $data['answer'],
            'block_context_id' => $data['block_context_id'] ?? null,
            'input_mode' => $data['input_mode'] ?? 'text',
        ]);

        return response()->json(['ok' => true]);
    }
}
