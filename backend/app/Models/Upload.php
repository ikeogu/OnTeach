<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Upload extends Model
{
    protected $fillable = [
        'session_id',
        'kind',
        'file_path',
        'original_name',
        'mime',
        'size',
        'ingested_at',
    ];

    protected function casts(): array
    {
        return [
            'ingested_at' => 'datetime',
            'size' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }
}
