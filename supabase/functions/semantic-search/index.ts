
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variable
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { text, action } = await req.json();

    if (!text) {
      throw new Error("Text is required");
    }

    // Split text into paragraphs for more detailed analysis
    const paragraphs = text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 30); // Filter out very short paragraphs

    if (action === "search") {
      // For each paragraph, generate embedding and find similar content
      const results = await Promise.all(
        paragraphs.map(async (paragraph) => {
          try {
            // Generate embedding for the paragraph
            const embeddingResponse = await openai.createEmbedding({
              model: "text-embedding-ada-002",
              input: paragraph,
            });

            const [{ embedding }] = embeddingResponse.data.data;

            // Search for similar content in the document_embeddings table
            const { data: similarDocs, error } = await supabase.rpc(
              'match_documents',
              {
                query_embedding: embedding,
                similarity_threshold: 0.8,
                match_count: 5,
              }
            );

            if (error) {
              console.error('Error searching for similar documents:', error);
              return {
                paragraph,
                matches: [],
              };
            }

            return {
              paragraph,
              matches: similarDocs || [],
            };
          } catch (error) {
            console.error(`Error processing paragraph: ${error.message}`);
            return {
              paragraph,
              matches: [],
              error: error.message,
            };
          }
        })
      );

      return new Response(
        JSON.stringify({ results }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    else if (action === "embed") {
      // Store paragraphs with their embeddings
      const storedEmbeddings = await Promise.all(
        paragraphs.map(async (paragraph) => {
          try {
            // Generate embedding for the paragraph
            const embeddingResponse = await openai.createEmbedding({
              model: "text-embedding-ada-002",
              input: paragraph,
            });

            const [{ embedding }] = embeddingResponse.data.data;

            // Create a content hash for deduplication
            const contentHash = await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(paragraph)
            );
            const hashHex = Array.from(new Uint8Array(contentHash))
              .map(b => b.toString(16).padStart(2, "0"))
              .join("");

            // Store the embedding in the database
            const { data, error } = await supabase
              .from('document_embeddings')
              .upsert({
                content_hash: hashHex,
                content: paragraph,
                embedding,
                source_url: null, // These would come from the source
                source_title: null,
                author: null,
                publication_date: null,
              })
              .select('id');

            if (error) {
              throw error;
            }

            return {
              id: data?.[0]?.id,
              success: true,
            };
          } catch (error) {
            console.error(`Error storing embedding: ${error.message}`);
            return {
              success: false,
              error: error.message,
            };
          }
        })
      );

      return new Response(
        JSON.stringify({ success: true, results: storedEmbeddings }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    throw new Error("Invalid action specified");

  } catch (error) {
    console.error(`Error in semantic-search: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
