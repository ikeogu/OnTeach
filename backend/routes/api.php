<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InternalSessionController;
use App\Http\Controllers\PublicSessionController;
use App\Http\Controllers\ScriptBlockController;
use App\Http\Controllers\ScriptGenerationController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/auth/register', RegisterController::class);
Route::post('/auth/login', LoginController::class);
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', fn (Request $request) => response()->json($request->user()));
    Route::patch('/me', function (Request $request) {
        $data = $request->validate(['account_type' => ['required', 'in:individual,team']]);
        $request->user()->update($data);
        return response()->json($request->user()->fresh());
    });

    // Sessions (creator)
    Route::apiResource('sessions', SessionController::class);
    Route::post('/sessions/{session}/publish', [SessionController::class, 'publish']);

    // Script blocks
    Route::get('/sessions/{session}/blocks', [ScriptBlockController::class, 'index']);
    Route::put('/sessions/{session}/blocks', [ScriptBlockController::class, 'replace']);

    // Uploads
    Route::post('/sessions/{session}/uploads', [UploadController::class, 'store']);

    // Script generation
    Route::post('/sessions/{session}/generate', [ScriptGenerationController::class, 'generate']);
    Route::get('/sessions/{session}/generate/status', [ScriptGenerationController::class, 'status']);

    // Dashboard & session insights
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/activity', [DashboardController::class, 'activity']);
    Route::get('/dashboard/students', [DashboardController::class, 'students']);
    Route::get('/sessions/{session}/stats', [DashboardController::class, 'sessionStats']);
    Route::get('/sessions/{session}/logs', [DashboardController::class, 'sessionLogs']);

    // File uploads
    Route::post('/sessions/{session}/cover', [SessionController::class, 'cover']);
    Route::post('/sessions/{session}/media', [SessionController::class, 'media']);
});

// Internal — called by FastAPI (shared secret guard is future work; localhost-only in dev)
Route::post('/internal/sessions/{session}/script-callback', [ScriptGenerationController::class, 'callback']);
Route::post('/internal/sessions/{session}/ingest-callback', [ScriptGenerationController::class, 'ingestCallback']);
Route::get('/internal/sessions/{session}/player-data', [InternalSessionController::class, 'playerData']);
Route::post('/internal/sessions/{session}/qa-log', [InternalSessionController::class, 'logQA']);

// Public — student entry (no auth)
Route::prefix('public/s')->group(function () {
    Route::get('/{shareSlug}', [PublicSessionController::class, 'show']);
    Route::post('/{shareSlug}/join', [PublicSessionController::class, 'join']);
});
Route::get('/public/embed/{embedSlug}', [PublicSessionController::class, 'showByEmbed']);
