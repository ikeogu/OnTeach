<?php

namespace App\Http\Controllers;

use App\Jobs\IngestUploadsJob;
use App\Models\Session;
use App\Models\Upload;
use App\Services\UploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private UploadService $uploadService) {}

    /**
     * Single endpoint — accepts file, text, or url; routes internally.
     */
    public function store(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $request->validate([
            'kind' => ['required', 'in:content,knowledge'],
        ]);

        $kind = $request->input('kind');

        if ($request->hasFile('file')) {
            $request->validate([
                'file' => ['file', 'max:102400', 'mimes:pdf,pptx,ppt,docx,doc,txt'],
            ]);
            $upload = $this->uploadService->store($session, $request->file('file'), $kind);
            return response()->json($upload, 201);
        }

        if ($request->filled('url')) {
            $request->validate(['url' => ['url', 'max:2048']]);
            $upload = Upload::create([
                'session_id'    => $session->id,
                'kind'          => $kind,
                'file_path'     => $request->input('url'),
                'original_name' => $request->input('url'),
                'mime'          => 'text/html',
                'size'          => 0,
            ]);
            IngestUploadsJob::dispatch($session, [$upload]);
            return response()->json($upload, 201);
        }

        if ($request->filled('text')) {
            $request->validate(['text' => ['string', 'max:200000']]);
            $upload = $this->uploadService->storeText($session, $request->input('text'), $kind);
            return response()->json($upload, 201);
        }

        return response()->json([
            'message' => 'Provide a file, url, or text field.',
        ], 422);
    }
}
