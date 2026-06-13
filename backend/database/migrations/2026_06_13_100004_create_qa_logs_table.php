<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qa_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_instance_id');
            $table->foreign('session_instance_id')->references('id')->on('session_instances')->cascadeOnDelete();
            $table->text('question');
            $table->text('answer');
            $table->foreignId('block_context_id')->nullable()->constrained('script_blocks')->nullOnDelete();
            $table->enum('input_mode', ['text', 'voice']);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_logs');
    }
};
