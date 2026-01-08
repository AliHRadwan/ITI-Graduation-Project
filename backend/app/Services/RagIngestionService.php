<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RagIngestionService
{
    protected string $ragApiUrl;

    public function __construct()
    {
        $this->ragApiUrl = config('services.rag.api_url', 'http://localhost:8000');
    }

    /**
     * Ingest a document into the RAG system
     *
     * @param string $filePath Absolute path to the .docx file
     * @param string $docCollection Collection name (folder) for RAG
     * @return array Response from RAG API
     * @throws \Exception
     */
    public function ingestDocument(string $filePath, string $docCollection): array
    {
        try {
            Log::info("Calling RAG API to ingest document", [
                'file_path' => $filePath,
                'doc_collection' => $docCollection,
                'api_url' => $this->ragApiUrl,
            ]);

            $response = Http::timeout(300) // 5 minutes timeout for large files
                ->post("{$this->ragApiUrl}/ingest-document", [
                    'file_path' => $filePath,
                    'doc_collection' => $docCollection,
                ]);

            if ($response->failed()) {
                $error = $response->json('detail') ?? $response->body();
                Log::error("RAG API ingestion failed", [
                    'status' => $response->status(),
                    'error' => $error,
                ]);
                throw new \Exception("RAG API error: {$error}");
            }

            $result = $response->json();
            
            Log::info("RAG API ingestion successful", [
                'chunks_count' => $result['chunks_count'] ?? 0,
                'file_name' => $result['file_name'] ?? 'unknown',
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error("Failed to call RAG API", [
                'exception' => $e->getMessage(),
                'file_path' => $filePath,
            ]);
            throw $e;
        }
    }

    /**
     * Test RAG API connectivity
     *
     * @return bool
     */
    public function testConnection(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->ragApiUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning("RAG API health check failed", ['exception' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get RAG API status
     *
     * @return array
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(5)->get("{$this->ragApiUrl}/");
            if ($response->successful()) {
                return $response->json();
            }
            return ['status' => 'unavailable'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}





