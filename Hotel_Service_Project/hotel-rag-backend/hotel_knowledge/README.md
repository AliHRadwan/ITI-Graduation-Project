# Hotel Knowledge Base

This directory contains the knowledge documents used by the RAG (Retrieval-Augmented Generation) system.

## Directory Structure

```
hotel_knowledge/
├── hotel_policies/          # Hotel policies, rules, terms & conditions
├── hotel_services/          # Services offered (spa, restaurant, etc.)
├── rooms_and_amenities/     # Room types, amenities, facilities
├── local_guide/             # Local attractions, restaurants, transportation
├── corporate/               # Corporate booking information
├── family-getaways/         # Family vacation packages
├── luxury-suites/           # Luxury accommodation details
├── party-times/             # Event and party planning
├── seaside-resorts/         # Beach resort information
└── waypoint-inns/           # Budget accommodation info
```

## Supported File Types

- **PDF** (.pdf)
- **Word Documents** (.docx, .doc)
- **Text Files** (.txt)

## How to Add Documents

### Option 1: Via Admin Dashboard (Recommended)
1. Login to the admin dashboard
2. Navigate to "Knowledge Base"
3. Click "Upload Document"
4. Select file, choose category, and upload
5. System will automatically process and embed the document

### Option 2: Manual Upload
1. Place your document in the appropriate category folder
2. Run the ingestion script:
   ```bash
   cd Hotel_Service_Project/hotel-rag-backend
   python -m app.ingest
   ```

## Document Processing

When a document is uploaded:
1. Text is extracted from the file
2. Text is split into chunks (overlap for context)
3. Each chunk is embedded using sentence transformers
4. Embeddings are stored in the vector database (ChromaDB)
5. Document metadata is saved to the backend database

## Important Notes

⚠️ **Large Files:**
- Documents larger than 10MB should be compressed or split
- PDF files work best when they contain searchable text (not scanned images)

⚠️ **Git Ignore:**
- Document files (*.pdf, *.docx) are ignored by git
- Only the directory structure is tracked
- This prevents repository bloat

⚠️ **Processing Time:**
- Small documents (< 1MB): ~30 seconds
- Medium documents (1-5MB): ~2 minutes
- Large documents (5-10MB): ~5 minutes

## Categories Explained

| Category | Purpose | Examples |
|----------|---------|----------|
| `hotel_policies` | Rules and regulations | Check-in/out times, cancellation policy, pet policy |
| `hotel_services` | Available services | Room service, concierge, laundry, gym hours |
| `rooms_and_amenities` | Accommodation details | Room types, bed sizes, amenities, pricing |
| `local_guide` | Area information | Restaurants, attractions, transportation, events |
| `corporate` | Business travelers | Meeting rooms, corporate rates, business services |
| `family-getaways` | Family packages | Kids activities, family rooms, child care |
| `luxury-suites` | Premium offerings | Suite features, VIP services, exclusive amenities |
| `party-times` | Events & celebrations | Wedding packages, conference rooms, catering |
| `seaside-resorts` | Beach properties | Beach access, water sports, coastal dining |
| `waypoint-inns` | Budget options | Economy rooms, basic amenities, quick stays |

## Testing the Knowledge Base

Use the RAG API to test document retrieval:

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What time is breakfast served?",
    "conversation_id": "test-123"
  }'
```

## Maintenance

### Reprocessing Documents
If embeddings need to be regenerated:
```bash
cd Hotel_Service_Project/hotel-rag-backend
python -m app.ingest --reprocess
```

### Clearing Vector Database
⚠️ This will delete all embeddings:
```bash
rm -rf chroma_db/
python -m app.ingest
```

## Best Practices

1. ✅ Use clear, descriptive filenames
2. ✅ Organize documents in correct categories
3. ✅ Keep documents up-to-date (remove outdated files)
4. ✅ Use searchable PDFs (not scanned images)
5. ✅ Break large documents into smaller, topic-specific files
6. ✅ Include dates in time-sensitive documents

## Troubleshooting

**Issue:** Documents not being found in searches
- **Solution:** Check if document was successfully ingested, view logs

**Issue:** Slow query responses
- **Solution:** Reduce chunk size or increase vector DB cache

**Issue:** Incorrect answers
- **Solution:** Verify source documents contain accurate information

---

For more information, see the main RAG backend README or contact the development team.

