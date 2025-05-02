
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector,
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity float,
  source_url TEXT,
  source_title TEXT,
  author TEXT,
  publication_date TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity,
    document_embeddings.source_url,
    document_embeddings.source_title,
    document_embeddings.author,
    document_embeddings.publication_date
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
