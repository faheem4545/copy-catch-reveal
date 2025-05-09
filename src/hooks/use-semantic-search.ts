
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
  publisher?: string;
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [statsList, setStatsList] = useState<{
    totalMatches: number;
    averageSimilarity: number;
    highestMatchRate: number;
  }>({
    totalMatches: 0,
    averageSimilarity: 0,
    highestMatchRate: 0
  });

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

      const results = data?.results || [];
      
      // Calculate statistics for the search results
      if (results.length > 0) {
        const allMatches = results.flatMap(r => r.matches);
        const totalMatches = allMatches.length;
        const averageSimilarity = totalMatches > 0 
          ? allMatches.reduce((sum, match) => sum + match.similarity, 0) / totalMatches 
          : 0;
        const highestMatchRate = totalMatches > 0
          ? Math.max(...allMatches.map(match => match.similarity))
          : 0;
          
        setStatsList({
          totalMatches,
          averageSimilarity,
          highestMatchRate
        });
      }

      return results;
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

  // Enhanced function to analyze sources for reliability
  const analyzeSourceReliability = (sources: { url: string, title: string }[]): { url: string, reliability: 'high' | 'medium' | 'low', score: number, reason: string }[] => {
    return sources.map(source => {
      try {
        const domain = new URL(source.url).hostname;
        let reliability: 'high' | 'medium' | 'low' = 'medium';
        let score = 50;
        let reason = '';
        
        // Educational and research domains are highly reliable
        if (domain.endsWith('.edu') || domain.endsWith('.gov') || 
            domain.includes('scholar.') || domain.includes('research.')) {
          reliability = 'high';
          score = 90;
          reason = 'Educational or government source';
        }
        // Known reliable news and established domains
        else if (domain.includes('nytimes') || domain.includes('bbc') || 
            domain.includes('reuters') || domain.includes('nature') || 
            domain.includes('science') || domain.endsWith('.org')) {
          reliability = 'high';
          score = 80;
          reason = 'Established news or scientific source';
        }
        // Blogs, forums, and personal sites are less reliable
        else if (domain.includes('blog') || domain.includes('forum') || 
            domain.endsWith('.io') || domain.endsWith('.me') || 
            domain.includes('medium.com')) {
          reliability = 'low';
          score = 30;
          reason = 'Blog or personal website';
        }
        
        return { url: source.url, reliability, score, reason };
      } catch (error) {
        // If URL parsing fails
        return { 
          url: source.url, 
          reliability: 'low' as const, 
          score: 20,
          reason: 'Invalid or malformed URL'
        };
      }
    });
  };

  // New function to generate summary statistics
  const generateContentStatistics = (text: string): {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    complexityScore: number;
  } => {
    if (!text || text.trim() === '') {
      return {
        wordCount: 0,
        sentenceCount: 0,
        avgSentenceLength: 0,
        complexityScore: 0
      };
    }

    // Count words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Count sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    
    // Calculate average sentence length
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Calculate a basic complexity score based on sentence length and word length
    const avgWordLength = words.length > 0 ? 
      words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
    
    const complexityScore = Math.min(100, Math.round((avgSentenceLength * 0.5 + avgWordLength * 5)));
    
    return {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      complexityScore
    };
  };

  return {
    searchSimilarContent,
    addContentToSemanticDb,
    analyzeSourceReliability,
    generateContentStatistics,
    searchStats: statsList,
    isSearching,
    error
  };
}
