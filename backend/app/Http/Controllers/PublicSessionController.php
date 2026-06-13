<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Services\StudentSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSessionController extends Controller
{
    public function __construct(private StudentSessionService $studentSessionService) {}

    public function show(string $shareSlug): JsonResponse
    {
        $session = Session::with('user')
            ->where('share_slug', $shareSlug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'id' => $session->id,
            'name' => $session->name,
            'cover_image_url' => $session->cover_image_url,
            'avatar_id' => $session->avatar_id,
            'creator_name' => $session->user->name,
        ]);
    }

    public function showByEmbed(string $embedSlug): JsonResponse
    {
        $session = Session::with('user')
            ->where('embed_slug', $embedSlug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'name'            => $session->name,
            'creator_name'    => $session->user->name,
            'cover_image_url' => $session->cover_image_url,
            'share_slug'      => $session->share_slug,
        ]);
    }

    public function join(Request $request, string $shareSlug): JsonResponse
    {
        $data = $request->validate([
            'student_name' => ['required', 'string', 'max:100'],
        ]);

        $session = Session::where('share_slug', $shareSlug)
            ->where('status', 'active')
            ->firstOrFail();

        $result = $this->studentSessionService->join($session, $data['student_name']);

        return response()->json($result, 201);
    }
}
