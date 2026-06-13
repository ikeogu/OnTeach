<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('script_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('sessions')->cascadeOnDelete();
            $table->unsignedInteger('order');
            $table->enum('type', ['spoken_text', 'media_insert', 'action_button', 'pause']);
            $table->json('payload');
            $table->string('bookmark_label')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('script_blocks');
    }
};
