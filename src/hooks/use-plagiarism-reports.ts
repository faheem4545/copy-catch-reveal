
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

export type PlagiarismReport = Database["public"]["Tables"]["plagiarism_reports"]["Row"];

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
