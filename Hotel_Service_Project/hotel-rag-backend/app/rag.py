"""RAG retrieval and answer generation."""

from typing import List, Optional, Tuple

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from sqlalchemy.orm import Session

from app.config import settings
from app.db import RAGChunk, search_chunks
from app.prompts import build_rag_prompt


class RAGEngine:
    """RAG engine for retrieval and answer generation."""

    def __init__(self):
        """Initialize RAG engine with embeddings and LLM."""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Initializing RAGEngine with LLM model: {settings.llm_model}")
        logger.info(f"Using embedding model: {settings.embedding_model}")
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.embedding_model,
            google_api_key=settings.google_api_key,
            output_dimensionality=settings.embedding_dim,
        )
        self.llm = ChatGroq(
            model=settings.llm_model,
            temperature=0,
            groq_api_key=settings.groq_api_key,
        )
        
        logger.info(f"RAGEngine initialized successfully with model: {settings.llm_model}")

    def retrieve_chunks(
        self,
        db: Session,
        question: str,
        top_k: int = 5,
        category: Optional[str] = None,
        doc_collection: Optional[str] = None,
    ) -> List[Tuple[RAGChunk, float]]:
        """
        Retrieve relevant chunks for a question.

        Args:
            db: Database session
            question: User's question
            top_k: Number of chunks to retrieve
            category: Optional category filter
            doc_collection: Optional doc_collection filter

        Returns:
            List of (chunk, distance) tuples sorted by distance
        """
        # Embed the question with configured output_dimensionality
        query_embedding = self.embeddings.embed_query(
            question,
            output_dimensionality=settings.embedding_dim
        )

        # Search database
        chunks = search_chunks(
            db=db,
            query_embedding=query_embedding,
            top_k=top_k,
            category=category,
            doc_collection=doc_collection,
        )

        return chunks

    def generate_answer(
        self,
        question: str,
        chunks: List[Tuple[RAGChunk, float]],
    ) -> str:
        """
        Generate an answer using retrieved chunks.

        Args:
            question: User's question
            chunks: List of (chunk, distance) tuples from retrieval

        Returns:
            Generated answer string
        """
        import logging
        logger = logging.getLogger(__name__)
        
        if not chunks:
            return "I don't have that information in the hotel knowledge base."

        try:
            # Build prompt with context
            prompt = build_rag_prompt(question, chunks)
            
            logger.debug(f"Generated prompt length: {len(prompt)} characters")
            
            # Generate answer - ChatGroq expects a list of messages or a string
            # LangChain's ChatGroq can accept a string and convert it
            response = self.llm.invoke(prompt)
            answer = response.content.strip()
            
            logger.info(f"Generated answer length: {len(answer)} characters")
            return answer
            
        except Exception as e:
            logger.error(f"Error generating answer with model {settings.llm_model}: {e}", exc_info=True)
            raise

    def ask(
        self,
        db: Session,
        question: str,
        top_k: int = 5,
        category: Optional[str] = None,
        doc_collection: Optional[str] = None,
    ) -> dict:
        """
        Complete RAG pipeline: retrieve and generate answer.

        Args:
            db: Database session
            question: User's question
            top_k: Number of chunks to retrieve
            category: Optional category filter
            doc_collection: Optional doc_collection filter

        Returns:
            Dictionary with answer, sources, and debug info
        """
        # Retrieve chunks
        chunks = self.retrieve_chunks(
            db=db,
            question=question,
            top_k=top_k,
            category=category,
            doc_collection=doc_collection,
        )

        # Generate answer
        answer = self.generate_answer(question, chunks)

        # Format sources
        sources = []
        for chunk, distance in chunks:
            sources.append(
                {
                    "doc_collection": chunk.doc_collection,
                    "source_file": chunk.source_file,
                    "section_title": chunk.section_title,
                    "category": chunk.category,
                }
            )

        # Format debug info
        debug_retrieved = []
        for chunk, distance in chunks:
            debug_retrieved.append(
                {
                    "distance": float(distance),
                    "content_preview": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                    "metadata": {
                        "doc_collection": chunk.doc_collection,
                        "source_file": chunk.source_file,
                        "section_title": chunk.section_title,
                        "category": chunk.category,
                        "audience": chunk.audience,
                    },
                }
            )

        return {
            "answer": answer,
            "sources": sources,
            "debug": {"retrieved": debug_retrieved},
        }


# Global RAG engine instance
rag_engine = RAGEngine()

