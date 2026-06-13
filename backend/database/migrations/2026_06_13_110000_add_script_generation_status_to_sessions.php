<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->enum('script_generation_status', ['idle', 'pending', 'processing', 'done', 'failed'])
                ->default('idle')
                ->after('status');
            $table->text('script_generation_error')->nullable()->after('script_generation_status');
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn(['script_generation_status', 'script_generation_error']);
        });
    }
};
