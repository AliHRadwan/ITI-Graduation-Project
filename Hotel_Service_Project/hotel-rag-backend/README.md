# Hotel RAG Backend

A production-ready RAG (Retrieval-Augmented Generation) backend for hotel information queries. This system processes hotel knowledge documents, generates embeddings, stores them in PostgreSQL with pgvector, and provides a FastAPI endpoint for querying the knowledge base.

## Features

- **Document Ingestion**: Processes .docx files from organized folders
- **Section Extraction**: Automatically detects and extracts sections based on heading styles
- **Intelligent Chunking**: Token-based chunking with overlap for better context
- **Vector Search**: Uses pgvector for efficient similarity search with cosine distance
- **Idempotent Ingestion**: Prevents duplicate chunks using SHA256 hashing
- **Citation Support**: Includes source citations in all answers
- **Guest-Focused**: Always filters for guest-facing information

## Prerequisites

- Python 3.9+
- PostgreSQL 17 with pgvector extension enabled
- Google AI Studio API key

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

Ensure PostgreSQL 17 is running with pgvector extension enabled:

```sql
CREATE DATABASE hotel_rag;
\c hotel_rag
CREATE EXTENSION vector;
```

The `rag_chunks` table should already exist. If you need to add the `chunk_hash` column for idempotent ingestion, run:

```sql
ALTER TABLE rag_chunks ADD COLUMN chunk_hash VARCHAR(64) UNIQUE;
CREATE INDEX idx_chunk_hash ON rag_chunks(chunk_hash);
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
copy .env.example .env
```

Edit `.env` with your actual values:
- `GOOGLE_API_KEY`: Your Google AI Studio API key
- `DATABASE_URL`: PostgreSQL connection string
- `EMBEDDING_MODEL`: Embedding model (default: gemini-embedding-001)
- `EMBEDDING_DIM`: Embedding dimension (must match the database VECTOR dimension, default: 1536)
- `LLM_MODEL`: LLM model (default: gemini-2.0-flash)
- Other settings as needed

## Usage

### Running Ingestion

Process all .docx files in the `hotel_knowledge` directory:

```bash
python -m app.ingest
```

The ingestion process will:
- Walk through all subdirectories in `hotel_knowledge/`
- Extract sections from each .docx file based on heading styles
- Chunk each section using token-based splitting
- Generate embeddings using Google Gemini (with output_dimensionality matching EMBEDDING_DIM setting to match database schema)
- Store chunks in the database (skipping duplicates via idempotent inserts)

### Running the Server

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Example API Request

**POST** `/ask`

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the check-in times?",
    "top_k": 5
  }'
```

**Request Body:**
```json
{
  "question": "What are the check-in times?",
  "category": "policies",
  "doc_collection": "corporate",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Check-in time is 3:00 PM. Early check-in may be available upon request. (Source: corporate/Example Corp Hospitality Group.docx — Check-In Policy)",
  "sources": [
    {
      "doc_collection": "corporate",
      "source_file": "Example Corp Hospitality Group.docx",
      "section_title": "Check-In Policy",
      "category": "policies"
    }
  ],
  "debug": {
    "retrieved": [
      {
        "distance": 0.123,
        "content_preview": "Check-in time is 3:00 PM...",
        "metadata": {
          "doc_collection": "corporate",
          "source_file": "Example Corp Hospitality Group.docx",
          "section_title": "Check-In Policy",
          "category": "policies",
          "audience": "guest"
        }
      }
    ]
  }
}
```

### Verifying Data

Check how many chunks have been ingested:

```sql
SELECT COUNT(*) FROM rag_chunks;
```

View sample chunks:

```sql
SELECT 
  doc_collection, 
  source_file, 
  section_title, 
  category,
  LENGTH(content) as content_length
FROM rag_chunks 
LIMIT 10;
```

## Project Structure

```
.
├── app/
│   ├── __init__.py          # Package initialization
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── db.py                # Database models and queries
│   ├── ingest.py            # Ingestion script
│   ├── rag.py               # RAG retrieval and generation
│   ├── loaders.py           # Document loading utilities
│   └── prompts.py           # Prompt templates
├── hotel_knowledge/         # Knowledge base directory
│   ├── corporate/
│   ├── family-getaways/
│   ├── luxury-suites/
│   ├── party-times/
│   ├── seaside-resorts/
│   └── waypoint-inns/
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Category Mapping

The system automatically maps document collections to categories:

- `corporate` → `policies`
- `luxury-suites` → `rooms_amenities`
- `waypoint-inns` → `local_guide`
- `family-getaways` → `services`
- `party-times` → `services`
- `seaside-resorts` → `services`

## Technical Details

### Chunking Strategy

1. **Section Extraction**: Documents are split by heading styles (Heading 1, Heading 2, etc.)
2. **Token-Based Chunking**: Each section is further chunked using `tiktoken` encoder
   - Chunk size: 650 tokens
   - Overlap: 100 tokens

### Embedding Model

- Model: `gemini-embedding-001`
- Dimension: Configurable via `EMBEDDING_DIM` environment variable (default: 1536)
- Provider: Google Gemini
- **Important**: The `output_dimensionality` parameter must match the database `VECTOR` dimension. Set `EMBEDDING_DIM` in your `.env` file to match your database schema (default: 1536)

### Similarity Search

- Uses PostgreSQL pgvector extension
- Cosine distance operator (`<=>`)
- Always filters by `audience='guest'` for safety

### Idempotency

Each chunk is assigned a unique hash (SHA256 of `doc_collection|source_file|section_title|content`). Re-running ingestion will skip chunks that already exist in the database using PostgreSQL `ON CONFLICT (chunk_hash) DO NOTHING`.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure pgvector extension is enabled: `CREATE EXTENSION vector;`

### Ingestion Errors

- Check that `.docx` files are valid Word documents
- Verify `HOTEL_KNOWLEDGE_DIR` path is correct
- Ensure Google API key is valid

### API Errors

- Check server logs for detailed error messages
- Verify database connection
- Ensure embeddings model is accessible

## License

This project is provided as-is for educational and development purposes.

