<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeDocument;
use App\Services\RagIngestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class KnowledgeDocumentController extends Controller
{
    protected RagIngestionService $ragService;

    public function __construct(RagIngestionService $ragService)
    {
        $this->ragService = $ragService;
    }

    /**
     * Get all knowledge documents
     */
    public function index(Request $request)
    {
        $query = KnowledgeDocument::with('uploader:id,name,email');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by title or filename
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('file_name', 'LIKE', "%{$search}%");
            });
        }

        $documents = $query->orderBy('uploaded_at', 'desc')->paginate(15);

        return response()->json($documents);
    }

    /**
     * Get single knowledge document
     */
    public function show($id)
    {
        $document = KnowledgeDocument::with('uploader:id,name,email')->findOrFail($id);
        return response()->json($document);
    }

    /**
     * Upload a new knowledge document
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|in:policies,rooms_amenities,local_guide,services',
            'file' => 'required|file|mimes:docx,pdf|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $category = $request->category;
            $docCollection = KnowledgeDocument::getDocCollection($category);
            
            // Generate unique filename
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $filename = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;

            // Ensure Laravel storage directory exists (using public disk)
            $laravelStorageDir = storage_path("app/public/knowledge-base/{$category}");
            if (!file_exists($laravelStorageDir)) {
                mkdir($laravelStorageDir, 0755, true);
            }

            // Store in Laravel storage using public disk
            $laravelPath = $file->storeAs("knowledge-base/{$category}", $filename, 'public');

            // Get RAG knowledge path from config
            $ragBasePath = config('services.rag.knowledge_path');
            $ragFolderPath = $ragBasePath . DIRECTORY_SEPARATOR . $docCollection;

            // Create RAG directory if it doesn't exist
            if (!file_exists($ragFolderPath)) {
                mkdir($ragFolderPath, 0755, true);
            }

            // Copy file to RAG knowledge directory
            $ragFilePath = $ragFolderPath . DIRECTORY_SEPARATOR . $filename;
            copy(storage_path("app/public/{$laravelPath}"), $ragFilePath);

            // Create database record
            $document = KnowledgeDocument::create([
                'uploaded_by' => $request->user()->id,
                'title' => $request->title,
                'file_name' => $filename,
                'file_path' => $laravelPath,
                'rag_file_path' => $ragFilePath,
                'category' => $category,
                'doc_collection' => $docCollection,
                'mime_type' => $file->getMimeType(),
                'file_size_bytes' => $file->getSize(),
                'status' => 'pending',
                'uploaded_at' => now(),
            ]);

            // Process document immediately
            try {
                $document->markAsProcessing();

                // Call RAG API to ingest
                $result = $this->ragService->ingestDocument($ragFilePath, $docCollection);

                // Mark as completed
                $document->markAsCompleted($result['chunks_count'] ?? 0);

                $document->load('uploader:id,name,email');

                return response()->json([
                    'message' => 'Document uploaded and processed successfully',
                    'document' => $document,
                ], 201);

            } catch (\Exception $e) {
                // Mark as failed but keep the record
                $document->markAsFailed($e->getMessage());

                return response()->json([
                    'message' => 'Document uploaded but processing failed',
                    'document' => $document,
                    'error' => $e->getMessage(),
                ], 201); // Still return 201 as upload succeeded
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upload document',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a knowledge document
     */
    public function destroy($id)
    {
        try {
            $document = KnowledgeDocument::findOrFail($id);

            // Delete from Laravel storage
            if (Storage::exists($document->file_path)) {
                Storage::delete($document->file_path);
            }

            // Delete from RAG knowledge directory
            if ($document->rag_file_path && file_exists($document->rag_file_path)) {
                unlink($document->rag_file_path);
            }

            // TODO: Call RAG API to delete chunks from vector database
            // This would require a new endpoint in the Python RAG backend

            // Delete database record
            $document->delete();

            return response()->json([
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete document',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reprocess a failed document
     */
    public function reprocess($id)
    {
        try {
            $document = KnowledgeDocument::findOrFail($id);

            if ($document->status === 'completed') {
                return response()->json([
                    'error' => 'Document is already processed'
                ], 400);
            }

            $document->markAsProcessing();

            // Call RAG API to ingest
            $result = $this->ragService->ingestDocument(
                $document->rag_file_path,
                $document->doc_collection
            );

            // Mark as completed
            $document->markAsCompleted($result['chunks_count'] ?? 0);

            $document->load('uploader:id,name,email');

            return response()->json([
                'message' => 'Document reprocessed successfully',
                'document' => $document,
            ]);

        } catch (\Exception $e) {
            $document->markAsFailed($e->getMessage());

            return response()->json([
                'error' => 'Failed to reprocess document',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test RAG API connection
     */
    public function testConnection()
    {
        $isConnected = $this->ragService->testConnection();
        $status = $this->ragService->getStatus();

        return response()->json([
            'connected' => $isConnected,
            'status' => $status,
        ]);
    }
}


