
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
    const { text } = await req.json();
    
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
      // Use OpenAI to analyze for AI-generated content
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
              content: "You are an AI content detector that evaluates text to determine if it was written by an AI or by a human. Return JSON only."
            },
            {
              role: "user",
              content: `Analyze this text and determine the probability it was written by an AI like ChatGPT, Bard, or Claude.
              Also list specific patterns that led to your determination.
              
              Text to analyze: "${text}"
              
              Return only a JSON object with these properties: 
              - aiProbability (0-100 percentage)
              - patterns (array of strings describing the AI patterns found)
              - model (string describing the detection model used, e.g., "GPT-4o-mini heuristic analysis")`
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
      const detectionResult = JSON.parse(aiResponse.choices[0].message.content);

      return new Response(
        JSON.stringify(detectionResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return new Response(
        JSON.stringify({ error: "Failed to analyze content for AI detection. Please try again later." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in detect-ai-content function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
