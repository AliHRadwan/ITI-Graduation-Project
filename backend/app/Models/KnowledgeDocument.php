<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeDocument extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'knowledge_documents';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'uploaded_by',
        'title',
        'file_name',
        'file_path',
        'rag_file_path',
        'category',
        'doc_collection',
        'mime_type',
        'file_size_bytes',
        'status',
        'error_message',
        'chunks_count',
        'uploaded_at',
        'processed_at',
    ];

    protected $casts = [
        'file_size_bytes' => 'integer',
        'chunks_count' => 'integer',
        'uploaded_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Category to doc_collection mapping for RAG
     */
    public static function getCategoryMapping(): array
    {
        return [
            'policies' => 'corporate',
            'rooms_amenities' => 'luxury-suites',
            'local_guide' => 'waypoint-inns',
            'services' => 'family-getaways',
        ];
    }

    /**
     * Get doc_collection from category
     */
    public static function getDocCollection(string $category): string
    {
        return self::getCategoryMapping()[$category] ?? 'general';
    }

    /**
     * Get the staff user who uploaded this document
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(StaffUser::class, 'uploaded_by');
    }

    /**
     * Mark document as processing
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark document as completed
     */
    public function markAsCompleted(int $chunksCount): void
    {
        $this->update([
            'status' => 'completed',
            'chunks_count' => $chunksCount,
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    /**
     * Mark document as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'processed_at' => now(),
        ]);
    }

    /**
     * Scope: Only completed documents
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Only failed documents
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope: Pending or processing
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }
}





