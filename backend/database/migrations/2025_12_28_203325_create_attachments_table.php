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
        Schema::create('attachments', function (Blueprint $table) {
            // $table->id();
            // $table->timestamps();

            $table->uuid('id')->primary();
            $table->uuid('message_id');
            $table->enum('type', ['image', 'audio', 'video', 'file']);
            $table->string('storage_url');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->text('transcript')->nullable();

            $table->foreign('message_id')->references('id')->on('messages')->cascadeOnDelete();

            $table->index(['message_id', 'type'], 'attachments_msg_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
