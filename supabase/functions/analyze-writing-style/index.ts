
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text, userId } = await req.json();
    
    if (!text || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize OpenAI API
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    try {
      // Use OpenAI to analyze writing style
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a writing style analyzer that evaluates text and provides metrics about the writing. Return JSON only."
            },
            {
              role: "user",
              content: `Analyze this text and provide the following metrics:
              1. A consistency score (0-100)
              2. A sentence variety score (0-100)
              3. A vocabulary richness score (0-100)
              4. A list of patterns or distinctive writing habits detected
              
              Text to analyze: "${text}"
              
              Return only a JSON object with these properties: consistencyScore, sentenceVariety, vocabularyRichness, patterns (array of strings)`
            }
          ],
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        // Handle quota exceeded error specially
        if (errorData.error?.code === "insufficient_quota") {
          return new Response(
            JSON.stringify({ 
              error: "OpenAI API quota exceeded. Please check your billing details or try again later.",
              quotaExceeded: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
          );
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const aiResponse = await response.json();
      let analysisResult = JSON.parse(aiResponse.choices[0].message.content);
      
      // Add user style matching if userId provided
      if (userId) {
        // In a real implementation, we would compare to stored user writing samples
        // Here we're adding a mock value for demonstration
        analysisResult.matchesUserStyle = true;
      }

      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return new Response(
        JSON.stringify({ error: "Failed to analyze writing style. Please try again later." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in analyze-writing-style function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
