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
        Schema::create('channel_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('channel_type'); // web, telegram, whatsapp
            $table->string('external_account_id')->unique(); // bot id / wa phone id / widget id
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channel_configs');
    }
};
