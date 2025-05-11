
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProcessedFile {
  name: string;
  wordCount?: number;
  similarityScore?: number;
  processed: boolean;
  error?: string | null;
}

interface FileBatch {
  name: string;
  content: string;
}

export function useBatchProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [progress, setProgress] = useState(0);
  
  const processBatch = async (files: FileBatch[], userId?: string): Promise<ProcessedFile[]> => {
    if (files.length === 0) {
      return [];
    }
    
    setIsProcessing(true);
    setProgress(0);
    setProcessedFiles([]);
    
    try {
      // Maximum number of files to send per batch
      const maxBatchSize = 10;
      const totalFiles = files.length;
      const results: ProcessedFile[] = [];
      
      // Process files in smaller batches to avoid timeouts or payload size limits
      for (let i = 0; i < totalFiles; i += maxBatchSize) {
        const batch = files.slice(i, Math.min(i + maxBatchSize, totalFiles));
        
        setProgress(Math.floor((i / totalFiles) * 100));
        
        const { data, error } = await supabase.functions.invoke("batch-process-files", {
          body: { files: batch, userId }
        });
        
        if (error) {
          console.error("Error processing batch:", error);
          throw new Error(`Batch processing failed: ${error.message}`);
        }
        
        if (data.results) {
          results.push(...data.results);
          setProcessedFiles(prev => [...prev, ...data.results]);
        }
      }
      
      setProgress(100);
      
      const processedCount = results.filter(file => file.processed).length;
      const failedCount = results.length - processedCount;
      
      if (failedCount === 0) {
        toast.success(`Successfully processed ${processedCount} files`);
      } else {
        toast.warning(`Processed ${processedCount} files, but ${failedCount} files failed`);
      }
      
      return results;
    } catch (error) {
      console.error("Error in batch processing:", error);
      toast.error("Failed to process batch of files");
      return [];
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    processBatch,
    isProcessing,
    processedFiles,
    progress
  };
}
