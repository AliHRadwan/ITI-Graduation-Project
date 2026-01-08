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
        Schema::create('knowledge_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uploaded_by'); // staff_user_id
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path'); // Laravel storage path
            $table->string('rag_file_path')->nullable(); // Path in RAG's hotel_knowledge/
            $table->enum('category', ['policies', 'rooms_amenities', 'local_guide', 'services']);
            $table->string('doc_collection'); // Folder name for RAG (corporate, luxury-suites, etc.)
            $table->string('mime_type');
            $table->integer('file_size_bytes');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('chunks_count')->default(0);
            $table->timestamp('uploaded_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('uploaded_by')->references('id')->on('staff_users')->cascadeOnDelete();
            
            $table->index('status');
            $table->index('category');
            $table->index('uploaded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_documents');
    }
};





