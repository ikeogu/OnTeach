<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_instances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('session_id')->constrained('sessions')->cascadeOnDelete();
            $table->string('student_name');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('last_block_id')->nullable()->constrained('script_blocks')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_instances');
    }
};
