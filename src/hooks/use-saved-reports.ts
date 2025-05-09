
import { useState } from "react";
import { usePlagiarismReports, PlagiarismReport, CitationSource } from "./use-plagiarism-reports";
import { toast } from "sonner";

export interface SaveReportOptions {
  title?: string;
  tags?: string[];
  notes?: string;
}

export function useSavedReports() {
  const [isSaving, setIsSaving] = useState(false);
  const { reports, saveReport, deleteReport } = usePlagiarismReports();

  const saveCurrentReport = async (
    content: string, 
    score: number, 
    options: SaveReportOptions,
    citationSuggestions?: CitationSource[]
  ) => {
    setIsSaving(true);
    
    try {
      await saveReport({
        title: options.title || `Report - ${new Date().toLocaleString()}`,
        content,
        score,
        word_count: content.split(/\s+/).filter(Boolean).length,
        status: "completed",
        citation_suggestions: citationSuggestions
      });
      
      toast.success("Report saved successfully");
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  const removeReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  return {
    savedReports: reports.data || [],
    isLoading: reports.isLoading,
    saveCurrentReport,
    removeReport,
    isSaving
  };
}
