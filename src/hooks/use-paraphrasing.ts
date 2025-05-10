
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SeverityLevel = "low" | "medium" | "high";

interface ParaphraseResult {
  original: string;
  paraphrased: string;
  explanation: string;
}

export function useParaphrasing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ParaphraseResult | null>(null);

  const paraphraseText = async (
    text: string, 
    context: string = "",
    severity: SeverityLevel = "medium"
  ): Promise<ParaphraseResult | null> => {
    if (!text || text.trim() === '') {
      toast.error("Please provide text to paraphrase");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('paraphrase-content', {
        body: { 
          text,
          context,
          severity
        }
      });

      if (error) {
        console.error('Error paraphrasing text:', error);
        setError(new Error(error.message || 'Error paraphrasing text'));
        toast.error("Failed to paraphrase text. Please try again.");
        return null;
      }

      setResult(data);
      return data;
    } catch (err) {
      console.error('Error in paraphrasing:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error("An unexpected error occurred during paraphrasing.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    paraphraseText,
    isParaphrasing: isLoading,
    paraphraseError: error,
    paraphraseResult: result,
    clearResult: () => setResult(null)
  };
}
