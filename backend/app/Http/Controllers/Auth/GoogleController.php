<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
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

    public function callback(): RedirectResponse
    {
        /** @var AbstractProvider $driver */
        $driver = Socialite::driver('google');

        try {
            $googleUser = $driver->stateless()->user();
        } catch (\Throwable) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            return redirect("{$frontendUrl}/login?error=google_failed");
        }

        ['user' => $user, 'token' => $token, 'is_new' => $isNew] =
            $this->authService->findOrCreateFromGoogle($googleUser);

        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $params = http_build_query([
            'token' => $token,
            'name'  => $user->name,
            'new'   => $isNew ? '1' : '0',
        ]);

        return redirect("{$frontendUrl}/auth/google/callback?{$params}");
    }
}
