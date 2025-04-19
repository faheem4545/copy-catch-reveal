
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlagiarismReport {
  id: string;
  title: string;
  score: number;
  word_count: number;
  created_at: string;
  status: string;
}

export function usePlagiarismReports() {
  return useQuery({
    queryKey: ["plagiarism-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plagiarism_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlagiarismReport[];
    },
  });
}
