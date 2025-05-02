
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, chunks = [], threshold = 0.8 } = await req.json();
    
    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize OpenAI client
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const configuration = new Configuration({ apiKey: openAiKey });
    const openai = new OpenAIApi(configuration);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Split text into paragraphs or use provided chunks
    const textChunks = chunks.length > 0 
      ? chunks 
      : text.split(/\n\n+/)
            .filter(p => p.trim().length > 30)
            .slice(0, 20); // Limit to 20 paragraphs

    // Process each chunk
    const results = [];
    for (const paragraph of textChunks) {
      if (paragraph.trim().length < 30) continue;

      // Generate embedding for the paragraph
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: paragraph.trim(),
      });

      const [{ embedding }] = embeddingResponse.data.data;

      // Search for similar content
      const { data: similarDocs, error } = await supabase
        .rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: threshold,
          match_count: 5
        });

      if (error) {
        console.error('Error searching for similar documents:', error);
        continue;
      }

      if (similarDocs && similarDocs.length > 0) {
        results.push({
          paragraph,
          matches: similarDocs.map(doc => ({
            similarity: doc.similarity,
            content: doc.content,
            source_url: doc.source_url,
            source_title: doc.source_title,
            author: doc.author,
            publication_date: doc.publication_date
          }))
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in semantic plagiarism check:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
