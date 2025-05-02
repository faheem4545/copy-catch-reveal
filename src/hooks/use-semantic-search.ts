
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SemanticMatchResult {
  similarity: number;
  content: string;
  source_url?: string;
  source_title?: string;
  author?: string;
  publication_date?: string;
}

export interface SemanticSearchResult {
  paragraph: string;
  matches: SemanticMatchResult[];
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchSimilarContent = async (text: string, threshold = 0.8): Promise<SemanticSearchResult[]> => {
    if (!text || text.trim() === '') {
      return [];
    }

    setIsSearching(true);
    setError(null);

    try {
      // Split text into paragraphs
      const paragraphs = text
        .split(/\n\n+/)
        .filter(p => p.trim().length > 30)
        .slice(0, 20); // Limit to 20 paragraphs

      const { data, error } = await supabase.functions.invoke('semantic-plagiarism-check', {
        body: { 
          text,
          chunks: paragraphs,
          threshold 
        }
      });

      if (error) {
        console.error('Error searching for similar content:', error);
        setError(new Error(error.message || 'Error searching for similar content'));
        return [];
      }

      return data?.results || [];
    } catch (err) {
      console.error('Error in semantic search:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchSimilarContent,
    isSearching,
    error
  };
}
