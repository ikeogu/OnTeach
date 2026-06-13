<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QaLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'session_instance_id',
        'question',
        'answer',
        'block_context_id',
        'input_mode',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function sessionInstance(): BelongsTo
    {
        return $this->belongsTo(SessionInstance::class);
    }

    public function blockContext(): BelongsTo
    {
        return $this->belongsTo(ScriptBlock::class, 'block_context_id');
    }
}
