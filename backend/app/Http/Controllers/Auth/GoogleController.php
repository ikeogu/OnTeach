<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class GoogleController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function redirect(): RedirectResponse
    {
        /** @var AbstractProvider $driver */
        $driver = Socialite::driver('google');

        return $driver->stateless()->redirect();
    }

    public function callback(): JsonResponse
    {
        /** @var AbstractProvider $driver */
        $driver = Socialite::driver('google');
        $googleUser = $driver->stateless()->user();

        $result = $this->authService->findOrCreateFromGoogle($googleUser);

        return response()->json($result);
    }
}
