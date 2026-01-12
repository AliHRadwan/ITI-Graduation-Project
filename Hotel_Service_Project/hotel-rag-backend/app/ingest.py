"""Ingestion script for processing hotel knowledge documents."""

import logging
import random
import time
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from sqlalchemy.orm import Session

from app.config import settings
from app.db import (
    get_db,
    generate_chunk_hash,
    init_db,
    insert_chunk,
)
from app.loaders import load_document_sections

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def is_rate_limit_error(e: Exception) -> bool:
    """Check if an exception is a rate limit/quota error."""
    msg = str(e).lower()
    return (
        "429" in msg
        or "too many requests" in msg
        or "rate limit" in msg
        or "quota" in msg
        or "resource_exhausted" in msg
    )


def with_backoff(fn, *, max_retries: int = 8):
    """
    Retry a function with exponential backoff on rate limit errors.
    
    Args:
        fn: Function to retry (callable that takes no args)
        max_retries: Maximum number of retry attempts (default: 8)
    
    Returns:
        Result of calling fn()
    
    Raises:
        RuntimeError: If all retries are exhausted
        Original exception: If error is not a rate limit error
    """
    last_exc = None
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            last_exc = e
            if not is_rate_limit_error(e):
                raise
            
            # Exponential backoff: 2^attempt seconds, capped at 60s, plus random jitter
            sleep_s = min(60.0, (2 ** attempt) + random.random())
            
            # Log the retry with attempt count and sleep duration
            logger.warning(
                "Rate limit hit (attempt %s/%s). Sleeping %.1fs then retrying...",
                attempt + 1,
                max_retries,
                sleep_s,
            )
            time.sleep(sleep_s)
    
    raise RuntimeError(
        f"Rate limit/quota kept failing after {max_retries} retries. "
        f"Try rerunning later or upgrading quota. Last error: {last_exc}"
    )


def process_file(file_path: Path, doc_collection: str, db: Session, embeddings: GoogleGenerativeAIEmbeddings):
    """
    Process a single .docx file: extract sections, chunk, embed, and store.

    Args:
        file_path: Path to the .docx file
        doc_collection: Collection name (folder name)
        db: Database session
        embeddings: Google Gemini embeddings model
    """
    logger.info(f"Processing file: {file_path}")

    try:
        # Load and extract sections
        sections = load_document_sections(file_path, doc_collection)
        logger.info(f"  Extracted {len(sections)} sections")

        # Initialize text splitter
        # Use cl100k_base encoding (compatible with GPT models, works well for chunking)
        # Note: The embedding model name doesn't affect tokenization for chunking
        text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            model_name="gpt-3.5-turbo",  # Use a known model for tokenizer mapping
            chunk_size=650,
            chunk_overlap=100,
        )

        total_chunks = 0
        new_chunks = 0
        skipped_chunks = 0

        # Process each section
        for section in sections:
            # Chunk the section
            chunks = text_splitter.split_documents([section])

            for chunk in chunks:
                total_chunks += 1

                # Generate chunk hash
                chunk_hash = generate_chunk_hash(
                    doc_collection=chunk.metadata["doc_collection"],
                    source_file=chunk.metadata["source_file"],
                    section_title=chunk.metadata.get("section_title", "Untitled Section"),
                    content=chunk.page_content,
                )

                # Generate embedding with configured output_dimensionality
                # Use exponential backoff retry for rate limit errors
                embedding = with_backoff(
                    lambda: embeddings.embed_query(
                        chunk.page_content,
                        output_dimensionality=settings.embedding_dim
                    )
                )

                # Insert into database (idempotent via ON CONFLICT)
                result = insert_chunk(
                    db=db,
                    content=chunk.page_content,
                    audience=chunk.metadata["audience"],
                    category=chunk.metadata["category"],
                    doc_collection=chunk.metadata["doc_collection"],
                    source_file=chunk.metadata["source_file"],
                    section_title=chunk.metadata.get("section_title"),
                    last_updated=chunk.metadata.get("last_updated"),
                    embedding=embedding,
                    chunk_hash=chunk_hash,
                )
                
                if result is None:
                    # Chunk already exists (conflict occurred)
                    skipped_chunks += 1
                    logger.debug(f"  Skipping duplicate chunk: {chunk_hash[:8]}...")
                else:
                    new_chunks += 1

        logger.info(
            f"  Completed: {total_chunks} total chunks, {new_chunks} new, {skipped_chunks} skipped"
        )

    except Exception as e:
        logger.error(f"  Error processing file {file_path}: {e}", exc_info=True)


def main():
    """Main ingestion function."""
    logger.info("Starting ingestion process...")

    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Initialize embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.google_api_key,
        output_dimensionality=settings.embedding_dim,
    )
    logger.info(f"Using embedding model: {settings.embedding_model} (dimension: {settings.embedding_dim})")

    # Get knowledge directory
    knowledge_dir = settings.knowledge_dir_path
    if not knowledge_dir.exists():
        logger.error(f"Knowledge directory not found: {knowledge_dir}")
        return

    logger.info(f"Scanning directory: {knowledge_dir}")

    # Get database session
    db = get_db()

    try:
        # Walk through knowledge directory
        docx_files = list(knowledge_dir.rglob("*.docx"))
        logger.info(f"Found {len(docx_files)} .docx files")

        for file_path in docx_files:
            relative_path = file_path.relative_to(knowledge_dir)
            doc_collection = relative_path.parts[0] if relative_path.parts else "unknown"

            process_file(file_path, doc_collection, db, embeddings)

        logger.info("Ingestion completed successfully!")

    except Exception as e:
        logger.error(f"Error during ingestion: {e}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    main()

