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
        Schema::create('proactive_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('trigger_type'); // ticket_created, sla_breach, status_changed, scheduled
            $table->json('trigger_config')->nullable();
            $table->text('message_template');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proactive_rules');
    }
};
