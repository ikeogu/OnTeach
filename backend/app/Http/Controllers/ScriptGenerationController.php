<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Models\Upload;
use App\Services\ScriptGenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScriptGenerationController extends Controller
{
    public function __construct(private ScriptGenerationService $generationService) {}

    public function generate(Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $session = $this->generationService->dispatch($session);

        return response()->json([
            'status' => $session->script_generation_status,
            'session' => $session,
        ]);
    }

    public function status(Session $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json([
            'status' => $session->script_generation_status,
            'error' => $session->script_generation_error,
        ]);
    }

    /** Called by FastAPI when script generation completes. */
    public function callback(Request $request, Session $session): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:done,failed'],
            'blocks' => ['required_if:status,done', 'array'],
            'blocks.*.type' => ['required_if:status,done', 'string'],
            'blocks.*.payload' => ['required_if:status,done', 'array'],
            'blocks.*.bookmark_label' => ['nullable', 'string'],
            'error' => ['nullable', 'string'],
        ]);

        if ($data['status'] === 'done') {
            $session->blocks()->delete();
            $records = array_map(fn ($block, $index) => [
                'session_id' => $session->id,
                'order' => $index,
                'type' => $block['type'],
                'payload' => json_encode($block['payload']),
                'bookmark_label' => $block['bookmark_label'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ], $data['blocks'], array_keys($data['blocks']));

            \App\Models\ScriptBlock::insert($records);
        }

        $session->update([
            'script_generation_status' => $data['status'],
            'script_generation_error' => $data['error'] ?? null,
        ]);

        return response()->json(['ok' => true]);
    }

    /** Called by FastAPI when ingestion (chunking + embedding) completes. */
    public function ingestCallback(Request $request, Session $session): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:done,failed'],
            'chunks_per_upload' => ['nullable', 'array'],
            'error' => ['nullable', 'string'],
        ]);

        if ($data['status'] === 'done' && ! empty($data['chunks_per_upload'])) {
            $uploadIds = array_keys($data['chunks_per_upload']);
            Upload::whereIn('id', $uploadIds)
                ->where('session_id', $session->id)
                ->update(['ingested_at' => now()]);
        }

        return response()->json(['ok' => true]);
    }
}
