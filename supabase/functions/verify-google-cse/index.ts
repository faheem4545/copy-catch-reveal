
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
    // Get Google CSE API key and CSE ID
    const googleApiKey = Deno.env.get('GOOGLE_CSE_API_KEY');
    const googleCseId = Deno.env.get('GOOGLE_CSE_ID');
    
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Google API key not configured", 
          error: "GOOGLE_CSE_API_KEY environment variable is missing" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!googleCseId) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Google CSE ID not configured", 
          error: "GOOGLE_CSE_ID environment variable is missing" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Make a test query to Google CSE
    const searchQuery = "test verification";
    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCseId}&q=${encodeURIComponent(searchQuery)}&num=1`;
    
    try {
      const response = await fetch(googleUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: "Google CSE request failed",
            error: errorData.error?.message || "Unknown Google CSE error"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }
      
      const data = await response.json();
      
      // Check if we got meaningful response data
      if (!data.items || data.items.length === 0) {
        return new Response(
          JSON.stringify({ 
            status: "success", 
            message: "Google CSE API key and ID are valid, but no search results were found",
            searchInformation: data.searchInformation
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          status: "success", 
          message: "Google CSE API key and ID are valid",
          searchInformation: data.searchInformation,
          resultCount: data.items?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          status: "error", 
          message: "Error calling Google CSE API",
          error: error.message || String(error)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: "Unexpected error in verify-google-cse function",
        error: error.message || String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
