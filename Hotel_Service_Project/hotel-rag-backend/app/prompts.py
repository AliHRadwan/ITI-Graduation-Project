"""Prompt templates for RAG answer generation."""

RAG_PROMPT_TEMPLATE = """You are a helpful assistant for a hotel. Answer the guest's question using ONLY the information provided in the context below.

Context:
{context}

Instructions:
1. Answer the question using ONLY the information from the context above.
2. If the context does not contain relevant information to answer the question, respond with: "I don't have that information in the hotel knowledge base."
3. Be concise and helpful. Do NOT include citations, source references, or document names in your answer.
4. Provide a natural, conversational response without mentioning file paths, document names, or source information.

Question: {question}

Answer:"""


def format_context_with_citations(chunks: list) -> str:
    """
    Format retrieved chunks as numbered context snippets (without explicit citations for LLM).

    Args:
        chunks: List of (chunk, distance) tuples from retrieval

    Returns:
        Formatted context string
    """
    context_parts = []
    for i, (chunk, distance) in enumerate(chunks, 1):
        # Include content without citation format - LLM doesn't need it
        context_parts.append(
            f"[{i}] {chunk.content}"
        )
    return "\n\n".join(context_parts)


def build_rag_prompt(question: str, chunks: list) -> str:
    """
    Build the RAG prompt with question and formatted context.

    Args:
        question: User's question
        chunks: List of (chunk, distance) tuples from retrieval

    Returns:
        Complete prompt string
    """
    context = format_context_with_citations(chunks)
    return RAG_PROMPT_TEMPLATE.format(context=context, question=question)

