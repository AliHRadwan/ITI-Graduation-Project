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
        Schema::create('ticket_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ticket_id')->nullable();
            $table->uuid('actor_staff_user_id')->nullable();
            $table->enum('event_type', [
                'created',
                'status_changed',
                'note_added',
                'merged',
                'escalated',
                'closed',
                'reopened',
                'assigned',
                'priority_changed',
            ])->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('set null');
            $table->foreign('actor_staff_user_id')->references('id')->on('staff_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_events');
    }
};
