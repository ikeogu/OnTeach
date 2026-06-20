<?php

namespace App\Jobs;

use App\Models\Session;
use App\Models\Upload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IngestUploadsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Session $session,
        private array $uploads,
    ) {}

    public function handle(): void
    {
        $aiServiceUrl = config('services.ai_service.url');
        $laravelUrl = config('services.ai_service.laravel_internal_url', config('app.url'));

        $refs = array_map(fn (Upload $upload) => [
            'upload_id' => $upload->id,
            'file_url' => $upload->file_path,
            'kind' => $upload->kind,
            'mime' => $upload->mime,
            'original_name' => $upload->original_name,
        ], $this->uploads);

        $callbackUrl = "{$laravelUrl}/api/internal/sessions/{$this->session->id}/ingest-callback";

        try {
            Http::timeout(30)->post("{$aiServiceUrl}/ingest", [
                'session_id' => $this->session->id,
                'upload_refs' => $refs,
                'callback_url' => $callbackUrl,
            ]);
        } catch (\Throwable $e) {
            Log::warning("IngestUploadsJob failed for session {$this->session->id}: {$e->getMessage()}");
        }
    }
}
