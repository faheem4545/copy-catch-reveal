
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RewriteStyle = 'academic' | 'casual' | 'technical' | 'creative';
export type RewritePurpose = 'plagiarism-fix' | 'clarity' | 'simplification' | 'elaboration';

export interface RewriteSuggestion {
  original: string;
  rewritten: string;
  explanation: string;
  similarityReduction?: number;
}

interface SmartRewriteOptions {
  style?: RewriteStyle;
  purpose?: RewritePurpose;
  preserveKeyTerms?: boolean;
  academicDiscipline?: string;
  targetReadingLevel?: 'elementary' | 'high-school' | 'undergraduate' | 'graduate' | 'expert';
}

export function useSmartRewriting() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<RewriteSuggestion[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const generateSmartRewritingSuggestions = async (
    text: string,
    flaggedSources: Array<{text: string, source?: string, similarity?: number}> = [],
    options: SmartRewriteOptions = {}
  ): Promise<RewriteSuggestion[]> => {
    if (!text || text.trim() === '') {
      toast.error("Please provide text to rewrite");
      return [];
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the edge function for smart rewriting
      const { data, error } = await supabase.functions.invoke('smart-content-rewriting', {
        body: { 
          text, 
          flaggedSources,
          options: {
            style: options.style || 'academic',
            purpose: options.purpose || 'plagiarism-fix',
            preserveKeyTerms: options.preserveKeyTerms !== false, // Default to true
            academicDiscipline: options.academicDiscipline,
            targetReadingLevel: options.targetReadingLevel || 'undergraduate'
          }
        }
      });
      
      if (error) {
        console.error("Error generating rewriting suggestions:", error);
        throw new Error(`Failed to generate suggestions: ${error.message}`);
      }
      
      if (!data || !Array.isArray(data.suggestions)) {
        throw new Error("Invalid response format from rewriting function");
      }
      
      setSuggestions(data.suggestions);
      return data.suggestions;
    } catch (err) {
      console.error("Error in smart rewriting:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast.error("Failed to generate rewriting suggestions");
      return [];
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateAcademicRewrite = async (
    text: string,
    context: string = "",
    discipline: string = "general"
  ): Promise<RewriteSuggestion | null> => {
    if (!text || text.trim() === '') {
      toast.error("Please provide text to rewrite");
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('academic-rewriter', {
        body: { 
          text, 
          context,
          discipline
        }
      });
      
      if (error) {
        console.error("Error generating academic rewrite:", error);
        throw new Error(`Failed to generate academic rewrite: ${error.message}`);
      }
      
      if (!data || !data.rewritten) {
        throw new Error("Invalid response format from academic rewriter function");
      }
      
      const suggestion: RewriteSuggestion = {
        original: text,
        rewritten: data.rewritten,
        explanation: data.explanation || "Text rewritten in academic style",
        similarityReduction: data.similarityReduction
      };
      
      setSuggestions([suggestion]);
      return suggestion;
    } catch (err) {
      console.error("Error in academic rewriting:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast.error("Failed to generate academic rewrite");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSmartRewritingSuggestions,
    generateAcademicRewrite,
    suggestions,
    isGenerating,
    error,
    clearSuggestions: () => setSuggestions([])
  };
}
