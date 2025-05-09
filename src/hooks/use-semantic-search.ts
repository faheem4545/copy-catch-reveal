
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

interface SourceInfo {
  url?: string;
  title?: string;
  author?: string;
  date?: string;
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchSimilarContent = async (text: string, threshold = 0.8, options = { minParagraphLength: 30, maxParagraphs: 20 }): Promise<SemanticSearchResult[]> => {
    if (!text || text.trim() === '') {
      return [];
    }

    setIsSearching(true);
    setError(null);

    try {
      // Split text into paragraphs with improved filtering
      const paragraphs = text
        .split(/\n\n+/)
        .filter(p => p.trim().length > options.minParagraphLength)
        .slice(0, options.maxParagraphs); // Limit to max paragraphs

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
  
  // Function to add content to the semantic database
  const addContentToSemanticDb = async (text: string, sourceInfo?: SourceInfo): Promise<boolean> => {
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

  // New function to analyze sources for reliability
  const analyzeSourceReliability = (sources: { url: string, title: string }[]): { url: string, reliability: 'high' | 'medium' | 'low' }[] => {
    return sources.map(source => {
      const domain = new URL(source.url).hostname;
      
      // Educational and research domains are highly reliable
      if (domain.endsWith('.edu') || domain.endsWith('.gov') || 
          domain.includes('scholar.') || domain.includes('research.')) {
        return { url: source.url, reliability: 'high' as const };
      }
      
      // Known reliable news and established domains
      if (domain.includes('nytimes') || domain.includes('bbc') || 
          domain.includes('reuters') || domain.includes('nature') || 
          domain.includes('science')) {
        return { url: source.url, reliability: 'high' as const };
      }
      
      // Blogs, forums, and personal sites are less reliable
      if (domain.includes('blog') || domain.includes('forum') || 
          domain.endsWith('.io') || domain.endsWith('.me')) {
        return { url: source.url, reliability: 'low' as const };
      }
      
      // Default to medium reliability
      return { url: source.url, reliability: 'medium' as const };
    });
  };

  return {
    searchSimilarContent,
    addContentToSemanticDb,
    analyzeSourceReliability,
    isSearching,
    error
  };
}
