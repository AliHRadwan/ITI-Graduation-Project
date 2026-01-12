"""Database connection and models for RAG chunks."""

import hashlib
import logging
from typing import List, Optional, Tuple

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    Index,
    String,
    Text,
    create_engine,
    text,
    TypeDecorator,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings

Base = declarative_base()


class Vector(TypeDecorator):
    """Custom type for pgvector VECTOR type."""

    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        """Return the dialect-specific type."""
        return dialect.type_descriptor(String)


class RAGChunk(Base):
    """SQLAlchemy model for rag_chunks table."""

    __tablename__ = "rag_chunks"

    id = Column(BigInteger, primary_key=True)
    content = Column(Text, nullable=False)
    audience = Column(String, nullable=False)
    category = Column(String, nullable=False)
    doc_collection = Column(String, nullable=False)
    source_file = Column(String, nullable=False)
    section_title = Column(String, nullable=True)
    last_updated = Column(Date, nullable=True)
    embedding = Column("embedding", String)  # Stored as string, cast to vector in SQL
    chunk_hash = Column(String(64), unique=True, nullable=True)

    __table_args__ = (
        Index("idx_chunk_hash", "chunk_hash"),
    )


# Database engine and session
# Ensure we use psycopg (version 3) driver instead of psycopg2
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif database_url.startswith("postgresql+psycopg2://"):
    database_url = database_url.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)

engine = create_engine(database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Get database session as a FastAPI dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database connection and register pgvector extension."""
    # Register pgvector with psycopg
    with engine.connect() as conn:
        # Enable pgvector extension if not already enabled
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()


def chunk_hash_exists(db: Session, chunk_hash: str) -> bool:
    """Check if a chunk hash already exists in the database."""
    result = db.query(RAGChunk).filter(RAGChunk.chunk_hash == chunk_hash).first()
    return result is not None


def insert_chunk(
    db: Session,
    content: str,
    audience: str,
    category: str,
    doc_collection: str,
    source_file: str,
    section_title: Optional[str],
    last_updated: Optional[str],
    embedding: List[float],
    chunk_hash: str,
) -> Optional[RAGChunk]:
    """
    Insert a new chunk into the database.
    
    Returns the inserted chunk, or None if chunk_hash already exists (idempotent).
    """
    # Convert embedding list to PostgreSQL array format for vector type
    embedding_str = "[" + ",".join(map(str, embedding)) + "]"
    
    # Use raw SQL to properly insert vector type with ON CONFLICT for idempotency
    # SQLAlchemy text() uses :param style bindings
    sql = text("""
        INSERT INTO rag_chunks 
        (content, audience, category, doc_collection, source_file, section_title, 
         last_updated, embedding, chunk_hash)
        VALUES 
        (:content, :audience, :category, :doc_collection, :source_file, :section_title,
         :last_updated, CAST(:embedding AS vector), :chunk_hash)
        ON CONFLICT (chunk_hash) DO NOTHING
        RETURNING id
    """)
    
    result = db.execute(sql, {
        "content": content,
        "audience": audience,
        "category": category,
        "doc_collection": doc_collection,
        "source_file": source_file,
        "section_title": section_title,
        "last_updated": last_updated,
        "embedding": embedding_str,
        "chunk_hash": chunk_hash,
    })
    db.commit()
    
    chunk_id = result.scalar()
    if chunk_id is None:
        # Chunk already exists (conflict occurred)
        return None
    
    chunk = db.query(RAGChunk).filter(RAGChunk.id == chunk_id).first()
    return chunk


def search_chunks(
    db: Session,
    query_embedding: List[float],
    top_k: int = 5,
    category: Optional[str] = None,
    doc_collection: Optional[str] = None,
) -> List[Tuple[RAGChunk, float]]:
    """
    Search for chunks using cosine distance.

    Returns list of (chunk, distance) tuples, sorted by distance (ascending).
    """
    logger = logging.getLogger(__name__)
    
    # Convert embedding list to PostgreSQL array format for vector type
    embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    # Build SQL query with pgvector cosine distance operator (<=>)
    # Use SQLAlchemy text() with :param style bindings only
    # Use CAST(:param AS vector) instead of :param::vector
    # Compute distance once and use alias in ORDER BY
    # Build WHERE clause dynamically to avoid ambiguous parameter type issues
    sql_parts = [
        "SELECT id, content, audience, category, doc_collection, source_file,",
        "       section_title, last_updated, embedding, chunk_hash,",
        "       (embedding <=> CAST(:query_embedding AS vector)) AS distance",
        "FROM rag_chunks",
        "WHERE audience = :audience",
    ]
    
    params = {
        "query_embedding": embedding_str,
        "audience": "guest",
        "top_k": int(top_k),
    }
    
    # Add category filter only if provided
    if category:
        sql_parts.append("AND category = :category")
        params["category"] = category
    
    # Add doc_collection filter only if provided
    if doc_collection:
        sql_parts.append("AND doc_collection = :doc_collection")
        params["doc_collection"] = doc_collection
    
    # Add ORDER BY and LIMIT
    sql_parts.append("ORDER BY distance")
    sql_parts.append("LIMIT :top_k")
    
    # Combine SQL parts
    sql = text(" ".join(sql_parts))
    
    # Log parameters for debugging
    logger.debug(f"Search params: embedding_len={len(embedding_str)}, top_k={top_k}, category={category}, doc_collection={doc_collection}")

    result = db.execute(sql, params)
    rows = result.mappings().all()

    chunks_with_distances = []
    for row in rows:
        chunk = db.query(RAGChunk).filter(RAGChunk.id == row["id"]).first()
        if chunk:
            chunks_with_distances.append((chunk, float(row["distance"])))

    return chunks_with_distances


def generate_chunk_hash(doc_collection: str, source_file: str, section_title: str, content: str) -> str:
    """Generate SHA256 hash for a chunk."""
    hash_input = f"{doc_collection}|{source_file}|{section_title}|{content}"
    return hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

