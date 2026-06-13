<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Services\ScriptBlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScriptBlockController extends Controller
{
    public function __construct(private ScriptBlockService $blockService) {}

    public function index(Session $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json($this->blockService->getBlocks($session));
    }

    public function replace(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $data = $request->validate([
            'blocks' => ['required', 'array'],
            'blocks.*.type' => ['required', 'in:spoken_text,media_insert,action_button,pause'],
            'blocks.*.payload' => ['required', 'array'],
            'blocks.*.bookmark_label' => ['nullable', 'string', 'max:100'],
        ]);

        $blocks = $this->blockService->replaceBlocks($session, $data['blocks']);

        return response()->json($blocks);
    }
}
