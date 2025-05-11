
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated language detection capabilities
const supportedLanguages = ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ar"];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { text, language = "en" } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supportedLanguages.includes(language)) {
      return new Response(
        JSON.stringify({ error: `Language '${language}' is not supported` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing text in language: ${language}`);
    
    // In a real implementation, this would:
    // 1. Use language-specific models or APIs for plagiarism detection
    // 2. Translate content if necessary
    // 3. Search language-specific databases or sources
    
    // For now, we'll simulate processing with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate simulated results
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
    
    const results = paragraphs.slice(0, 5).map(paragraph => {
      const matchProbability = Math.random();
      
      return {
        paragraph,
        language,
        matches: matchProbability > 0.7 ? [
          {
            similarity: Math.random() * 0.5 + 0.3,
            content: paragraph.substring(0, paragraph.length * 0.8) + "...",
            source_url: `https://example-${language}.com/article-${Math.floor(Math.random() * 1000)}`,
            source_title: `${language.toUpperCase()} Example Source ${Math.floor(Math.random() * 100)}`,
            publication_date: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0],
          }
        ] : []
      };
    });
    
    const stats = {
      languageDetected: language,
      confidence: 0.95,
      totalMatches: results.filter(r => r.matches.length > 0).length,
      averageSimilarity: results.filter(r => r.matches.length > 0).length > 0 
        ? results
            .flatMap(r => r.matches)
            .reduce((sum, match) => sum + match.similarity, 0) / 
              results.flatMap(r => r.matches).length
        : 0
    };
    
    return new Response(
      JSON.stringify({ results, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in multilingual-plagiarism-check function:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
