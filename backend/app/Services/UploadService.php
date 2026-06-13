<?php

namespace App\Services;

use App\Jobs\IngestUploadsJob;
use App\Models\Session;
use App\Models\Upload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadService
{
    private const ALLOWED_MIMES = ['application/pdf', 'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'];

    private const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

    public function store(Session $session, UploadedFile $file, string $kind): Upload
    {
        $path = $file->store("sessions/{$session->id}/uploads", 'local');

        $upload = Upload::create([
            'session_id' => $session->id,
            'kind' => $kind,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize(),
        ]);

        IngestUploadsJob::dispatch($session, [$upload]);

        return $upload;
    }
}
