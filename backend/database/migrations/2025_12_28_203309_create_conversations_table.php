<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            // $table->id();
            // $table->timestamps();
            $table->uuid('id')->primary();
            $table->uuid('guest_identity_id');
            $table->uuid('room_id')->nullable();
            $table->enum('status', ['open', 'handoff', 'closed'])->default('open');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_seen_at')->nullable();
            
            $table->foreign('guest_identity_id')->references('id')->on('guest_identities')->cascadeOnDelete();

            // لو جدول rooms موجود:
            // $table->foreign('room_id')
            //     ->references('id')->on('rooms')
            //     ->nullOnDelete();

            $table->index(['guest_identity_id', 'status'], 'conversations_guest_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
