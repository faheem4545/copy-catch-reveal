
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export type PlagiarismReport = Database["public"]["Tables"]["plagiarism_reports"]["Row"];

export function usePlagiarismReports() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["plagiarism-reports", user?.id],
    queryFn: async () => {
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
        toast.error("Failed to load plagiarism reports");
        throw error;
      }
      
      return data as PlagiarismReport[];
    },
    enabled: !!user, // Only run the query if the user is logged in
  });
}
