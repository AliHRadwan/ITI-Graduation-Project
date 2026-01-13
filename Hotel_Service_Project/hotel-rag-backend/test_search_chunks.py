"""Smoke test for search_chunks() to verify ambiguous parameter fix."""

import sys
from app.db import get_db, search_chunks
from app.config import settings

# Create a dummy embedding for testing (must match EMBEDDING_DIM)
# Using a simple embedding vector
DUMMY_EMBEDDING = [0.1] * settings.embedding_dim


def test_search_chunks():
    """Test search_chunks with various parameter combinations."""
    db = get_db()
    
    try:
        print("Testing search_chunks() with different parameter combinations...")
        
        # Test 1: No filters
        print("\n1. Testing with no filters (category=None, doc_collection=None)...")
        results = search_chunks(
            db=db,
            query_embedding=DUMMY_EMBEDDING,
            top_k=5,
            category=None,
            doc_collection=None,
        )
        print(f"   ✓ Success: Found {len(results)} chunks")
        
        # Test 2: With category filter
        print("\n2. Testing with category filter...")
        results = search_chunks(
            db=db,
            query_embedding=DUMMY_EMBEDDING,
            top_k=5,
            category="policies",
            doc_collection=None,
        )
        print(f"   ✓ Success: Found {len(results)} chunks with category='policies'")
        
        # Test 3: With doc_collection filter
        print("\n3. Testing with doc_collection filter...")
        results = search_chunks(
            db=db,
            query_embedding=DUMMY_EMBEDDING,
            top_k=5,
            category=None,
            doc_collection="corporate",
        )
        print(f"   ✓ Success: Found {len(results)} chunks with doc_collection='corporate'")
        
        # Test 4: With both filters
        print("\n4. Testing with both category and doc_collection filters...")
        results = search_chunks(
            db=db,
            query_embedding=DUMMY_EMBEDDING,
            top_k=5,
            category="policies",
            doc_collection="corporate",
        )
        print(f"   ✓ Success: Found {len(results)} chunks with both filters")
        
        print("\n✅ All tests passed! No AmbiguousParameter errors.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = test_search_chunks()
    sys.exit(0 if success else 1)

