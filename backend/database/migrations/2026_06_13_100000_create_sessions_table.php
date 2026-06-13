<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('mode', ['smarter_video', 'private_tutor', 'live_classroom', 'assistant'])->default('smarter_video');
            $table->enum('status', ['draft', 'active'])->default('draft');
            $table->string('avatar_id')->nullable();
            $table->string('voice_id')->nullable();
            $table->string('background')->default('neutral_studio');
            $table->string('cover_image_url')->nullable();
            $table->string('share_slug')->unique()->nullable();
            $table->string('embed_slug')->unique()->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
