
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

export interface PlagiarismReport {
  id: string;
  title: string;
  score: number;
  word_count: number;
  created_at: string;
  status: string;
  user_id: string;
  content: string;
}

export function usePlagiarismReports() {
  return useQuery({
    queryKey: ["plagiarism-reports"],
    queryFn: async () => {
      // Since we're using RLS, we don't need to filter by user_id in the query
      // RLS will handle that based on the authenticated user
      const { data, error } = await supabase
        .from("plagiarism_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlagiarismReport[];
    },
  });
}
