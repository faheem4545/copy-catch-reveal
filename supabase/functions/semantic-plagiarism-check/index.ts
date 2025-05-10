
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
    const { text, chunks = [], threshold = 0.8, action = "search", sourceInfo = {}, searchOptions = {} } = await req.json();
    
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

    // Default options for extraction
    const options = {
      minParagraphLength: searchOptions.minParagraphLength || 40,
      maxParagraphs: searchOptions.maxParagraphs || 25,
      excludeCommonPhrases: searchOptions.excludeCommonPhrases !== false // Default to true
    };

    // Common phrases to potentially exclude (if option enabled)
    const commonPhrases = [
      "in conclusion", 
      "for example", 
      "on the other hand",
      "in summary",
      "as a result",
      "due to the fact that"
    ];

    // Improved text chunking that filters common phrases if enabled
    const getTextChunks = (text) => {
      // Split by paragraphs first
      const paragraphs = text.split(/\n\n+/);
      
      return paragraphs
        .filter(p => {
          const trimmed = p.trim();
          // Filter out very short paragraphs
          if (trimmed.length < options.minParagraphLength) return false;
          
          // Optionally filter out paragraphs that are just common phrases
          if (options.excludeCommonPhrases) {
            const lowerText = trimmed.toLowerCase();
            // Skip paragraphs that are just common transitional phrases
            if (commonPhrases.some(phrase => lowerText === phrase)) return false;
          }
          
          return true;
        })
        .slice(0, options.maxParagraphs); // Limit total paragraphs
    };

    // Split text into paragraphs or use provided chunks
    const textChunks = chunks.length > 0 
      ? chunks 
      : getTextChunks(text);

    if (action === "search") {
      // Process each chunk for search
      const results = [];
      for (const paragraph of textChunks) {
        if (paragraph.trim().length < 30) continue;

        try {
          // Generate embedding for the paragraph
          const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: paragraph.trim(),
          });

          const [{ embedding }] = embeddingResponse.data.data;

          // Search for similar content with improved matching
          const { data: similarDocs, error } = await supabase
            .rpc('match_documents', {
              query_embedding: embedding,
              match_threshold: threshold,
              match_count: 10 // Increased from 5
            });

          if (error) {
            console.error('Error searching for similar documents:', error);
            continue;
          }

          // Filter out results with very low similarity if we have enough matches
          let filteredResults = similarDocs || [];
          if (filteredResults.length > 5) {
            // If we have many results, we can be more selective
            filteredResults = filteredResults
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 5);
          }

          if (filteredResults.length > 0) {
            results.push({
              paragraph,
              matches: filteredResults.map(doc => ({
                similarity: doc.similarity,
                content: doc.content,
                source_url: doc.source_url,
                source_title: doc.source_title,
                author: doc.author,
                publication_date: doc.publication_date
              }))
            });
          } else {
            results.push({
              paragraph,
              matches: []
            });
          }
        } catch (err) {
          console.error(`Error processing paragraph for search: ${err.message}`);
          results.push({
            paragraph,
            matches: [],
            error: err.message
          });
        }
      }

      // Calculate content statistics to include with results
      const contentStats = {
        analyzedParagraphs: textChunks.length,
        totalWordCount: text.split(/\s+/).filter(Boolean).length,
        paragraphsWithMatches: results.filter(r => r.matches.length > 0).length,
        averageSimilarity: results.reduce((sum, r) => {
          const avgSim = r.matches.reduce((s, m) => s + m.similarity, 0) / (r.matches.length || 1);
          return sum + (r.matches.length ? avgSim : 0);
        }, 0) / (results.filter(r => r.matches.length > 0).length || 1)
      };

      return new Response(
        JSON.stringify({ 
          results,
          stats: contentStats
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === "embed") {
      // Store paragraphs with their embeddings
      const { url, title, author, date, publisher } = sourceInfo;
      
      const storedEmbeddings = await Promise.all(
        textChunks.map(async (paragraph) => {
          try {
            if (paragraph.trim().length < 30) {
              return { success: false, reason: 'Paragraph too short' };
            }
            
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
                source_url: url,
                source_title: title,
                author,
                publication_date: date
              })
              .select('id');

            if (error) {
              console.error('Error storing embedding:', error);
              return { success: false, error: error.message };
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
        JSON.stringify({ 
          success: true, 
          results: storedEmbeddings, 
          stats: {
            total: storedEmbeddings.length,
            successful: storedEmbeddings.filter(e => e.success).length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (action === "analyze") {
      // New function to analyze text similarity without storing
      // This is useful for quick checks without embedding or storing data
      
      // Generate embedding for input text
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: text.substring(0, 8000), // Limit to avoid token limitations
      });

      const [{ embedding }] = embeddingResponse.data.data;

      // Search for similar content
      const { data: similarDocs, error } = await supabase
        .rpc('match_documents', {
          query_embedding: embedding,
          match_threshold: threshold,
          match_count: 10
        });

      if (error) {
        throw new Error(`Error analyzing text: ${error.message}`);
      }

      // Return analysis results
      return new Response(
        JSON.stringify({ 
          matches: similarDocs || [],
          similarity_score: similarDocs && similarDocs.length > 0
            ? Math.max(...similarDocs.map(doc => doc.similarity)) * 100
            : 0,
          has_matches: (similarDocs || []).length > 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action specified" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error in semantic plagiarism check:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
