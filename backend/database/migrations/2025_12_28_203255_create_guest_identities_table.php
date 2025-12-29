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
        Schema::create('guest_identities', function (Blueprint $table) {
            // $table->id();
            // $table->timestamps();

            $table->uuid('id')->primary();
            $table->string('channel_type'); // e.g. whatsapp, web, messenger
            $table->string('channel_user_id'); // external user id
            $table->string('preferred_language')->nullable();
            $table->timestamp('first_seen_at')->useCurrent();

            $table->unique(['channel_type', 'channel_user_id'], 'guest_identity_channel_unique');
            $table->index(['channel_type', 'channel_user_id'], 'guest_identity_channel_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_identities');
    }
};
