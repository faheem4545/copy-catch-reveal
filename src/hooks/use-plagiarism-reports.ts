
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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

  // New function to save a plagiarism report
  const saveReport = async (report: Omit<PlagiarismReport, "id" | "user_id" | "created_at">): Promise<PlagiarismReport> => {
    if (!user) {
      throw new Error("User must be logged in to save reports");
    }

    const newReport = {
      user_id: user.id,
      ...report,
      word_count: report.content.split(/\s+/).filter(Boolean).length,
      status: "completed"
    };

    const { data, error } = await supabase
      .from("plagiarism_reports")
      .insert(newReport)
      .select()
      .single();

    if (error) {
      console.error("Error saving plagiarism report:", error);
      throw error;
    }

    return data;
  };

  // New function to delete a report
  const deleteReport = async (reportId: string): Promise<void> => {
    if (!user) {
      throw new Error("User must be logged in to delete reports");
    }

    const { error } = await supabase
      .from("plagiarism_reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting plagiarism report:", error);
      throw error;
    }
  };

  // New mutation to save reports
  const saveMutation = useMutation({
    mutationFn: saveReport,
    onSuccess: () => {
      // Invalidate the reports query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["plagiarismReports", user?.id] });
    },
  });

  // New mutation to delete reports
  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plagiarismReports", user?.id] });
    },
  });

  return {
    reports: useQuery({
      queryKey: ["plagiarismReports", user?.id],
      queryFn: fetchReports,
      enabled: !!user,
      refetchOnWindowFocus: false,
    }),
    saveReport: saveMutation.mutate,
    deleteReport: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    saveError: saveMutation.error,
    deleteError: deleteMutation.error
  };
};
