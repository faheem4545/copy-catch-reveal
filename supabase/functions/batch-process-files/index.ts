
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FileToProcess = {
  name: string;
  content: string;
  userId?: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { files, userId } = await req.json() as { files: FileToProcess[], userId?: string };
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided or invalid format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process files in batches to avoid timeouts
    const batchSize = 5;
    const results = [];
    
    console.log(`Processing ${files.length} files in batches of ${batchSize}`);
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (file) => {
        try {
          console.log(`Processing file: ${file.name}`);
          
          // In a real implementation, this would handle different file formats
          // and extract text, perform plagiarism detection, etc.
          
          // For now, we'll just simulate processing
          const wordCount = file.content.split(/\s+/).filter(Boolean).length;
          const similarityScore = Math.floor(Math.random() * 30); // Random score for demo
          
          return {
            name: file.name,
            wordCount,
            similarityScore,
            processed: true,
            error: null
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            name: file.name,
            processed: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      }));
      
      results.push(...batchResults);
      
      // Brief pause between batches to avoid overloading
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Processed ${results.length} files`);
    
    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in batch-process-files function:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
