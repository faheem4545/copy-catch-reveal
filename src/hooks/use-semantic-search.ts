
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
          threshold,
          action: "search" // Explicitly set the action to search
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
  
  // New function to add content to the semantic database
  const addContentToSemanticDb = async (text: string, sourceInfo?: {
    url?: string;
    title?: string;
    author?: string;
    date?: string;
  }): Promise<boolean> => {
    if (!text || text.trim() === '') {
      return false;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('semantic-plagiarism-check', {
        body: { 
          text,
          action: "embed",
          sourceInfo
        }
      });
      
      if (error) {
        console.error('Error adding content to semantic database:', error);
        setError(new Error(error.message || 'Error adding content to semantic database'));
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in adding content to semantic database:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchSimilarContent,
    addContentToSemanticDb,
    isSearching,
    error
  };
}
