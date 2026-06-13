<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Services\UploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private UploadService $uploadService) {}

    public function store(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $data = $request->validate([
            'kind' => ['required', 'in:content,knowledge'],
            'file' => ['required', 'file', 'max:102400', 'mimes:pdf,pptx,ppt,docx,doc,txt'],
        ]);

        $upload = $this->uploadService->store($session, $data['file'], $data['kind']);

        return response()->json($upload, 201);
    }
}
