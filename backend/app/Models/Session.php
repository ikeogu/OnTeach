<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'mode',
        'status',
        'script_generation_status',
        'script_generation_error',
        'avatar_id',
        'voice_id',
        'background',
        'cover_image_url',
        'share_slug',
        'embed_slug',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(ScriptBlock::class)->orderBy('order');
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(Upload::class);
    }

    public function instances(): HasMany
    {
        return $this->hasMany(SessionInstance::class);
    }
}
