"""FastAPI application for hotel RAG backend."""

import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db, init_db
from app.rag import rag_engine

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Hotel RAG Backend",
    description="RAG backend for hotel knowledge base queries",
    version="1.0.0",
)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class AskRequest(BaseModel):
    """Request model for /ask endpoint."""

    question: str = Field(..., description="The question to ask")
    category: Optional[str] = Field(None, description="Optional category filter")
    doc_collection: Optional[str] = Field(None, description="Optional doc_collection filter")
    top_k: int = Field(5, ge=1, le=20, description="Number of chunks to retrieve")


class Source(BaseModel):
    """Source citation model."""

    doc_collection: str
    source_file: str
    section_title: Optional[str]
    category: str


class DebugRetrieved(BaseModel):
    """Debug info for retrieved chunk."""

    distance: float
    content_preview: str
    metadata: dict


class AskResponse(BaseModel):
    """Response model for /ask endpoint."""

    answer: str
    sources: List[Source]
    debug: dict


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    logger.info("Initializing database...")
    init_db()
    logger.info("Application started")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Hotel RAG Backend API",
        "version": "1.0.0",
        "endpoints": {
            "ask": "/ask (POST)",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to check configuration."""
    from app.config import settings
    return {
        "llm_model": settings.llm_model,
        "embedding_model": settings.embedding_model,
        "embedding_dim": settings.embedding_dim,
        "groq_api_key_set": bool(settings.groq_api_key),
        "google_api_key_set": bool(settings.google_api_key),
    }


def is_gemini_quota_error(e: Exception) -> bool:
    """Check if an exception is a Gemini quota/rate-limit error."""
    msg = str(e).lower()
    error_type = type(e).__name__.lower()
    
    # Check error message for quota/rate limit indicators
    if (
        "429" in msg
        or "too many requests" in msg
        or "rate limit" in msg
        or "quota" in msg
        or "resource_exhausted" in msg
        or "ratelimiterror" in error_type
    ):
        return True
    
    # Check for Google API status codes
    if hasattr(e, "code") and e.code == 429:
        return True
    
    if hasattr(e, "status_code") and e.status_code == 429:
        return True
    
    return False


@app.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    db: Session = Depends(get_db),
):
    """
    Ask a question to the hotel knowledge base.

    Returns an answer with citations and debug information.
    """
    try:
        logger.info(f"Received question: {request.question[:100]}...")

        # Validate inputs
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        # Process question through RAG pipeline
        result = rag_engine.ask(
            db=db,
            question=request.question,
            top_k=request.top_k,
            category=request.category,
            doc_collection=request.doc_collection,
        )

        logger.info(f"Generated answer with {len(result['sources'])} sources")

        return AskResponse(**result)

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        print(f"[DEBUG] Validation error: {e}")
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Print to console for debugging
        import traceback
        print(f"\n[DEBUG] ===== ERROR IN /ask ENDPOINT =====")
        print(f"[DEBUG] Error type: {type(e).__name__}")
        print(f"[DEBUG] Error message: {str(e)}")
        print(f"[DEBUG] Traceback:")
        traceback.print_exc()
        print(f"[DEBUG] =====================================\n")
        
        # Check for Gemini quota/rate-limit errors
        if is_gemini_quota_error(e):
            logger.warning(f"Gemini quota/rate-limit error: {e}")
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded or rate limit reached. Please try again later."
            )
        
        # Log the full error details
        error_msg = str(e)
        error_type = type(e).__name__
        logger.error(f"Error processing question - Type: {error_type}, Message: {error_msg}", exc_info=True)
        
        # Return more detailed error in development (you can make this conditional)
        detail_msg = f"Internal server error: {error_type}: {error_msg}"
        raise HTTPException(status_code=500, detail=detail_msg)


class IngestDocumentRequest(BaseModel):
    """Request model for /ingest-document endpoint."""

    file_path: str = Field(..., description="Absolute path to the .docx file")
    doc_collection: str = Field(..., description="Collection name (category folder)")


class IngestDocumentResponse(BaseModel):
    """Response model for /ingest-document endpoint."""

    success: bool
    message: str
    chunks_count: int
    file_name: str


@app.post("/ingest-document", response_model=IngestDocumentResponse)
async def ingest_document(
    request: IngestDocumentRequest,
    db: Session = Depends(get_db),
):
    """
    Ingest a single document file into the knowledge base.
    
    This endpoint processes a single .docx file, extracts sections,
    generates embeddings, and stores chunks in the database.
    """
    try:
        from pathlib import Path
        from app.ingest import process_file
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        
        logger.info(f"Received ingestion request for: {request.file_path}")
        
        # Validate file path
        file_path = Path(request.file_path)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")
        
        if not file_path.suffix.lower() == '.docx':
            raise HTTPException(status_code=400, detail="Only .docx files are supported")
        
        # Initialize embeddings
        embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.embedding_model,
            google_api_key=settings.google_api_key,
            output_dimensionality=settings.embedding_dim,
        )
        
        # Process the file
        # Count chunks before processing
        from app.db import RAGChunk
        chunks_before = db.query(RAGChunk).filter(
            RAGChunk.doc_collection == request.doc_collection,
            RAGChunk.source_file == file_path.name
        ).count()
        
        # Process the file
        process_file(file_path, request.doc_collection, db, embeddings)
        
        # Count chunks after processing
        chunks_after = db.query(RAGChunk).filter(
            RAGChunk.doc_collection == request.doc_collection,
            RAGChunk.source_file == file_path.name
        ).count()
        
        new_chunks = chunks_after - chunks_before
        
        logger.info(f"Successfully ingested {new_chunks} chunks from {file_path.name}")
        
        return IngestDocumentResponse(
            success=True,
            message=f"Successfully ingested {new_chunks} chunks",
            chunks_count=new_chunks,
            file_name=file_path.name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ingesting document: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ingest document: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

