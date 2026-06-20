<?php

namespace App\Services;

use App\Jobs\IngestUploadsJob;
use App\Models\Session;
use App\Models\Upload;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;

class UploadService
{
    public function storeText(Session $session, string $text, string $kind): Upload
    {
        $tmp = tempnam(sys_get_temp_dir(), 'upload_') . '.txt';
        file_put_contents($tmp, $text);

        try {
            $cloudinary = $this->cloudinary();
            $result = $cloudinary->uploadApi()->upload($tmp, [
                'resource_type' => 'raw',
                'folder'        => "sessions/{$session->id}/uploads",
            ]);
            $cloudUrl = $result['secure_url'];
        } finally {
            @unlink($tmp);
        }

        $upload = Upload::create([
            'session_id'    => $session->id,
            'kind'          => $kind,
            'file_path'     => $cloudUrl,
            'original_name' => 'pasted-content.txt',
            'mime'          => 'text/plain',
            'size'          => strlen($text),
        ]);

        IngestUploadsJob::dispatch($session, [$upload]);

        return $upload;
    }

    private function cloudinary(): Cloudinary
    {
        return new Cloudinary(Configuration::instance([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]));
    }

    public function store(Session $session, UploadedFile $file, string $kind): Upload
    {
        $cloudinary = $this->cloudinary();

        $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
            'resource_type' => 'raw',
            'folder'        => "sessions/{$session->id}/uploads",
        ]);

        $cloudUrl = $result['secure_url'];

        $upload = Upload::create([
            'session_id'    => $session->id,
            'kind'          => $kind,
            'file_path'     => $cloudUrl,
            'original_name' => $file->getClientOriginalName(),
            'mime'          => $file->getMimeType() ?? 'application/octet-stream',
            'size'          => $file->getSize(),
        ]);

        IngestUploadsJob::dispatch($session, [$upload]);

        return $upload;
    }
}
