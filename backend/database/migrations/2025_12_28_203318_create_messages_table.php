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
        Schema::create('messages', function (Blueprint $table) {
            // $table->id();
            // $table->timestamps();

            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->enum('role', ['guest', 'agent', 'staff', 'system']);
            $table->text('content');
            $table->json('extracted_entities')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();

            $table->index(['conversation_id', 'created_at'], 'messages_conv_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
