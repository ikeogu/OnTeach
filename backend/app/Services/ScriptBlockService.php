<?php

namespace App\Services;

use App\Models\Session;
use Illuminate\Support\Collection;

class ScriptBlockService
{
    public function getBlocks(Session $session): Collection
    {
        return $session->blocks()->get();
    }

    public function replaceBlocks(Session $session, array $blocks): Collection
    {
        $session->blocks()->delete();

        $records = array_map(fn ($block, $index) => [
            'session_id' => $session->id,
            'order' => $index,
            'type' => $block['type'],
            'payload' => json_encode($block['payload']),
            'bookmark_label' => $block['bookmark_label'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ], $blocks, array_keys($blocks));

        if (! empty($records)) {
            \App\Models\ScriptBlock::insert($records);
        }

        return $session->blocks()->get();
    }
}
