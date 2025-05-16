
import { useState, useCallback } from "react";
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

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  const generateSmartRewritingSuggestions = useCallback(async (
    text: string,
    flaggedSources: Array<{text: string, source?: string, similarity?: number}> = [],
    options: SmartRewriteOptions = {}
  ): Promise<RewriteSuggestion[]> => {
    if (!text || text.trim() === '') {
      const error = new Error("Please provide text to rewrite");
      toast.error(error.message);
      setError(error);
      return [];
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call the edge function for smart rewriting
      const { data, error: apiError } = await supabase.functions.invoke('smart-content-rewriting', {
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
      
      if (apiError) {
        console.error("Error generating rewriting suggestions:", apiError);
        const error = new Error(`Failed to generate suggestions: ${apiError.message}`);
        setError(error);
        toast.error("Failed to generate rewriting suggestions. Please try again later.");
        throw error;
      }
      
      if (!data || !Array.isArray(data.suggestions)) {
        const error = new Error("Invalid response format from rewriting function");
        setError(error);
        toast.error("Received invalid data format from rewriting service.");
        throw error;
      }
      
      // Add some validation to ensure we have properly formatted suggestions
      const validatedSuggestions = data.suggestions.filter((suggestion: any) => 
        suggestion && 
        typeof suggestion.original === 'string' && 
        typeof suggestion.rewritten === 'string'
      );
      
      if (validatedSuggestions.length === 0 && data.suggestions.length > 0) {
        const fallbackSuggestion: RewriteSuggestion = {
          original: text,
          rewritten: "Could not generate a specific rewrite. Please try again with different text.",
          explanation: "The system encountered a processing issue with this text.",
          similarityReduction: 0
        };
        setSuggestions([fallbackSuggestion]);
        return [fallbackSuggestion];
      }
      
      setSuggestions(validatedSuggestions);
      return validatedSuggestions;
    } catch (err) {
      console.error("Error in smart rewriting:", err);
      const errorObj = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(errorObj);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  const generateAcademicRewrite = useCallback(async (
    text: string,
    context: string = "",
    discipline: string = "general"
  ): Promise<RewriteSuggestion | null> => {
    if (!text || text.trim() === '') {
      const error = new Error("Please provide text to rewrite");
      toast.error(error.message);
      setError(error);
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await supabase.functions.invoke('academic-rewriter', {
        body: { 
          text, 
          context,
          discipline
        }
      });
      
      if (apiError) {
        console.error("Error generating academic rewrite:", apiError);
        const error = new Error(`Failed to generate academic rewrite: ${apiError.message}`);
        setError(error);
        toast.error("Failed to generate academic rewrite. Please try again later.");
        throw error;
      }
      
      if (!data || !data.rewritten) {
        const error = new Error("Invalid response format from academic rewriter function");
        setError(error);
        toast.error("Received invalid data from academic rewriting service.");
        throw error;
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
      const errorObj = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(errorObj);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateSmartRewritingSuggestions,
    generateAcademicRewrite,
    suggestions,
    isGenerating,
    error,
    clearSuggestions
  };
}
