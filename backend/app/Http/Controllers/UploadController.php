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

    public function storeUrl(Request $request, Session $session): JsonResponse
    {
        $this->authorize('update', $session);

        $data = $request->validate([
            'kind' => ['required', 'in:content,knowledge'],
            'url'  => ['required', 'url', 'max:2048'],
        ]);

        $upload = Upload::create([
            'session_id'    => $session->id,
            'kind'          => $data['kind'],
            'file_path'     => $data['url'],
            'original_name' => $data['url'],
            'mime'          => 'text/html',
            'size'          => 0,
        ]);

        IngestUploadsJob::dispatch($session, [$upload]);

        return response()->json($upload, 201);
    }
}
