<?php

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class SessionService
{
    public function listForUser(User $user): Collection
    {
        return $user->sessions()->latest()->get();
    }

    public function create(User $user, string $name, string $mode): Session
    {
        return $user->sessions()->create([
            'name' => $name,
            'mode' => $mode,
        ]);
    }

    public function update(Session $session, array $data): Session
    {
        $session->update($data);

        return $session->fresh();
    }

    public function delete(Session $session): void
    {
        $session->delete();
    }

    public function publish(Session $session): Session
    {
        $session->update([
            'status' => 'active',
            'share_slug' => $this->generateUniqueSlug(),
            'embed_slug' => $this->generateUniqueSlug(),
            'published_at' => now(),
        ]);

        return $session->fresh();
    }

    public function uploadCover(Session $session, UploadedFile $file): Session
    {
        if ($session->cover_image_url) {
            $existing = str_replace(
                rtrim(Storage::disk('public')->url(''), '/') . '/',
                '',
                $session->cover_image_url
            );
            if (Storage::disk('public')->exists($existing)) {
                Storage::disk('public')->delete($existing);
            }
        }

        $path = $file->store('covers', 'public');
        $url  = Storage::disk('public')->url($path);

        $session->update(['cover_image_url' => $url]);

        return $session->fresh();
    }

    public function uploadMedia(UploadedFile $file): array
    {
        $path = $file->store('media', 'public');
        return ['url' => Storage::disk('public')->url($path)];
    }

    private function generateUniqueSlug(): string
    {
        do {
            $slug = bin2hex(random_bytes(8));
        } while (
            Session::where('share_slug', $slug)->exists() ||
            Session::where('embed_slug', $slug)->exists()
        );

        return $slug;
    }
}
