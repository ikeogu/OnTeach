<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function __construct(private SessionService $sessionService) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->sessionService->listForUser($request->user()));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:smarter_video,private_tutor,live_classroom,assistant'],
        ]);

        $session = $this->sessionService->create($request->user(), $data['name'], $data['mode']);

        return response()->json($session, 201);
    }

    public function show(Session $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json($session->load('blocks', 'uploads'));
    }

    public function update(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'avatar_id' => ['sometimes', 'nullable', 'string'],
            'voice_id' => ['sometimes', 'nullable', 'string'],
            'background' => ['sometimes', 'string'],
            'cover_image_url' => ['sometimes', 'nullable', 'url'],
        ]);

        return response()->json($this->sessionService->update($session, $data));
    }

    public function destroy(Session $session): JsonResponse
    {
        $this->authorize('delete', $session);

        $this->sessionService->delete($session);

        return response()->json(null, 204);
    }

    public function publish(Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        return response()->json($this->sessionService->publish($session));
    }

    public function cover(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $request->validate([
            'cover' => ['required', 'image', 'max:4096'],
        ]);

        return response()->json($this->sessionService->uploadCover($session, $request->file('cover')));
    }
}
