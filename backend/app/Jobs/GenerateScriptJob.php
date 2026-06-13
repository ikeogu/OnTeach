<?php

namespace App\Jobs;

use App\Models\Session;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateScriptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;
    public int $tries = 2;

    public function __construct(private Session $session) {}

    public function handle(): void
    {
        $session = $this->session->fresh();
        $session->update(['script_generation_status' => 'processing']);

        $uploads = $session->uploads()->get();
        $contentRefs = $uploads->where('kind', 'content')->pluck('file_path')->values()->all();
        $knowledgeRefs = $uploads->where('kind', 'knowledge')->pluck('file_path')->values()->all();

        $callbackUrl = config('services.ai_service.laravel_internal_url', config('app.url'))
            . "/api/internal/sessions/{$session->id}/script-callback";

        try {
            Http::timeout(300)->post(config('services.ai_service.url') . '/generate-script', [
                'session_id' => $session->id,
                'content_refs' => $contentRefs,
                'knowledge_refs' => $knowledgeRefs,
                'callback_url' => $callbackUrl,
            ]);
        } catch (\Throwable $e) {
            Log::error("GenerateScriptJob failed for session {$session->id}: {$e->getMessage()}");
            $session->update([
                'script_generation_status' => 'failed',
                'script_generation_error' => $e->getMessage(),
            ]);
        }
    }
}
