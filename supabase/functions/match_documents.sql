
-- This function matches documents based on embedding similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  source_url text,
  source_title text,
  author text,
  publication_date text,
  content_hash text
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
    document_embeddings.publication_date,
    document_embeddings.content_hash
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add this function to analyze plagiarism severity
CREATE OR REPLACE FUNCTION analyze_plagiarism_severity(
  similarity_score float,
  content_length int,
  matched_count int
)
RETURNS TABLE (
  severity_level text,
  severity_score int,
  recommendation text
)
LANGUAGE plpgsql
AS $$
DECLARE
  final_score int;
  sev_level text;
  rec text;
BEGIN
  -- Calculate a weighted score based on similarity, content length, and match count
  final_score := LEAST(100, GREATEST(0, 
    CASE 
      WHEN content_length < 100 THEN similarity_score * 1.2 -- Short content gets higher severity
      WHEN content_length > 1000 THEN similarity_score * 0.9 -- Long content gets slightly lower severity
      ELSE similarity_score
    END +
    CASE
      WHEN matched_count > 10 THEN 15 -- Many matches increases severity
      WHEN matched_count > 5 THEN 10
      WHEN matched_count > 2 THEN 5
      ELSE 0
    END
  ));
  
  -- Determine severity level
  IF final_score < 20 THEN
    sev_level := 'low';
    rec := 'Minor revision recommended';
  ELSIF final_score < 40 THEN
    sev_level := 'medium';
    rec := 'Moderate revision and citation needed';
  ELSIF final_score < 70 THEN
    sev_level := 'high';
    rec := 'Substantial rewriting required';
  ELSE
    sev_level := 'critical';
    rec := 'Complete rewrite necessary';
  END IF;
  
  RETURN QUERY SELECT sev_level, final_score, rec;
END;
$$;
