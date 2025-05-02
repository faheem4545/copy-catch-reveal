
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SemanticSearchMatch {
  id: string;
  content: string;
  similarity: number;
  source_url: string | null;
  source_title: string | null;
  author: string | null;
  publication_date: string | null;
}

export interface SemanticSearchResult {
  paragraph: string;
  matches: SemanticSearchMatch[];
  error?: string;
}

export function useSemanticSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const { toast } = useToast();

  const searchSimilarContent = async (text: string) => {
    if (!text.trim()) {
      return [];
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("semantic-search", {
        body: { text, action: "search" },
      });

      if (error) {
        console.error("Semantic search error:", error);
        toast({
          title: "Search Error",
          description: "Failed to perform semantic search",
          variant: "destructive",
        });
        return [];
      }

      setResults(data.results);
      return data.results;
    } catch (err) {
      console.error("Error in semantic search:", err);
      toast({
        title: "Search Error",
        description: "An unexpected error occurred during semantic search",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const storeEmbeddings = async (text: string, sourceInfo?: {
    sourceUrl?: string;
    sourceTitle?: string;
    author?: string;
    publicationDate?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("semantic-search", {
        body: { 
          text, 
          action: "embed",
          sourceInfo
        },
      });

      if (error) {
        console.error("Embedding storage error:", error);
        toast({
          title: "Storage Error",
          description: "Failed to store embeddings",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error storing embeddings:", err);
      toast({
        title: "Storage Error",
        description: "An unexpected error occurred while storing embeddings",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    searchSimilarContent,
    storeEmbeddings,
    results,
    isSearching,
  };
}
