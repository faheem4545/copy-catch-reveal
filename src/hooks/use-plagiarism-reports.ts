
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

export interface CitationSource {
  title?: string;
  author?: string;
  url?: string;
  date?: string;
  publisher?: string;
}

export interface PlagiarismReport {
  id: string;
  user_id: string;
  title: string;
  content: string;
  score: number;
  word_count: number;
  created_at: string;
  status: string;
  citation_suggestions?: CitationSource[];
}

export const usePlagiarismReports = () => {
  const { user } = useAuth();

  const fetchReports = async (): Promise<PlagiarismReport[]> => {
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("plagiarism_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plagiarism reports:", error);
      throw error;
    }

    // Transform the JSON data to match the CitationSource type
    return (data || []).map(report => ({
      ...report,
      citation_suggestions: Array.isArray(report.citation_suggestions) 
        ? report.citation_suggestions.map((citation: any) => ({
            title: citation.title || undefined,
            author: citation.author || undefined,
            url: citation.url || undefined,
            date: citation.date || undefined,
            publisher: citation.publisher || undefined
          }))
        : undefined
    }));
  };

  return useQuery({
    queryKey: ["plagiarismReports", user?.id],
    queryFn: fetchReports,
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
};
