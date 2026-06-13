<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScriptBlock extends Model
{
    protected $fillable = [
        'session_id',
        'order',
        'type',
        'payload',
        'bookmark_label',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'order' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }
}
