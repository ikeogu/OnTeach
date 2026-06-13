<?php

namespace App\Services;

use App\Jobs\GenerateScriptJob;
use App\Models\Session;

class ScriptGenerationService
{
    public function dispatch(Session $session): Session
    {
        $session->update([
            'script_generation_status' => 'pending',
            'script_generation_error' => null,
        ]);

        GenerateScriptJob::dispatch($session);

        return $session->fresh();
    }
}
