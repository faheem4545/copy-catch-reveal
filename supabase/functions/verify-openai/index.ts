
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
    // Initialize OpenAI API
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "OpenAI API key not configured", 
          error: "OPENAI_API_KEY environment variable is missing" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Make a minimal API call to verify the key
    try {
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
              role: "user",
              content: "This is a test. Return the string 'API Key Valid' if you can read this message."
            }
          ],
          max_tokens: 20
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: "OpenAI API key invalid or API request failed",
            error: errorData.error
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ 
          status: "success", 
          message: "OpenAI API key is valid",
          model: data.model,
          response: data.choices?.[0]?.message?.content || "No content returned"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Error calling OpenAI API",
          error: error.message || String(error)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: "Unexpected error in verify-openai function",
        error: error.message || String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
