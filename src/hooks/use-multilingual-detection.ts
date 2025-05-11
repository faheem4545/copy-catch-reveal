
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MultilingualSearchResult {
  paragraph: string;
  language: string;
  matches: {
    similarity: number;
    content: string;
    source_url?: string;
    source_title?: string;
    publication_date?: string;
  }[];
}

interface DetectionStats {
  languageDetected: string;
  confidence: number;
  totalMatches: number;
  averageSimilarity: number;
}

export function useMultilingualDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState<MultilingualSearchResult[]>([]);
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const detectPlagiarism = async (text: string, language: string = "en"): Promise<MultilingualSearchResult[]> => {
    if (!text || text.trim() === '') {
      return [];
    }
    
    setIsDetecting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("multilingual-plagiarism-check", {
        body: { text, language }
      });
      
      if (error) {
        console.error("Error detecting plagiarism:", error);
        throw new Error(`Plagiarism detection failed: ${error.message}`);
      }
      
      if (data.results) {
        setResults(data.results);
      }
      
      if (data.stats) {
        setStats(data.stats);
      }
      
      return data.results || [];
    } catch (err) {
      console.error("Error in multilingual plagiarism detection:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast.error("Failed to detect plagiarism");
      return [];
    } finally {
      setIsDetecting(false);
    }
  };
  
  const detectLanguage = async (text: string): Promise<string> => {
    if (!text || text.trim() === '') {
      return "en"; // Default to English if no text is provided
    }
    
    try {
      // In a real implementation, this would call a language detection API
      // For now, we'll simulate detection with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Default to English for demo purposes
      return "en";
    } catch (err) {
      console.error("Error detecting language:", err);
      return "en"; // Default to English on error
    }
  };
  
  return {
    detectPlagiarism,
    detectLanguage,
    isDetecting,
    results,
    stats,
    error
  };
}
