
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  kind: string;
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

interface SearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

// Add more detailed logging
function logEvent(type: string, data: any): void {
  try {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      timestamp,
      type,
      data
    }));
  } catch (error) {
    console.error("Error logging event:", error);
  }
}

serve(async (req) => {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  
  logEvent('request_received', { 
    id: requestId,
    method: req.method,
    path: new URL(req.url).pathname
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Retrieve API key from environment variables
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CSE_API_KEY');
    const GOOGLE_CSE_ID = Deno.env.get('GOOGLE_CSE_ID') || 'a52863c5312114c0a';
    
    logEvent('api_key_status', { 
      keyPresent: !!GOOGLE_API_KEY,
      cseIdPresent: !!GOOGLE_CSE_ID
    });

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      logEvent('parse_error', { error: parseError.message });
      return new Response(
        JSON.stringify({ error: 'Invalid request body', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      logEvent('validation_error', { error: 'Invalid query parameter' });
      return new Response(
        JSON.stringify({ error: 'Invalid query parameter', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // If no API key, return mock results
    if (!GOOGLE_API_KEY) {
      logEvent('mock_results', { reason: 'No API key available' });
      const mockSources = [
        {
          url: "https://example.edu/academic-paper",
          title: "Sample Academic Source",
          snippet: "A sample snippet about " + query,
          type: "academic",
          matchPercentage: 60
        },
        {
          url: "https://trusted-news.com/article",
          title: "Trusted News Article",
          snippet: "An article discussing " + query,
          type: "trusted",
          matchPercentage: 45
        }
      ];
      
      return new Response(
        JSON.stringify({ 
          sources: mockSources,
          note: "Using mock results - Configure GOOGLE_CSE_API_KEY in Supabase secrets"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Construct search URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', GOOGLE_API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_CSE_ID);
    searchUrl.searchParams.append('q', query);

    logEvent('search_initiated', { query, cseId: GOOGLE_CSE_ID });
    
    try {
      const response = await fetch(searchUrl.toString());
      const data: SearchResponse = await response.json();
      
      if (!response.ok || data.error) {
        logEvent('search_api_error', { 
          status: response.status, 
          error: data.error || response.statusText 
        });
        
        throw new Error(data.error?.message || 'Search API request failed');
      }

      const sources = (data.items || []).map(item => ({
        url: item.link,
        title: item.title,
        snippet: item.snippet || "",
        type: determineSourceType(item.link),
        matchPercentage: Math.floor(Math.random() * 50) + 30 // Random percentage for demo
      }));

      const endTime = performance.now();
      logEvent('search_completed', { 
        sourceCount: sources.length,
        processingTimeMs: Math.round(endTime - startTime)
      });
      
      return new Response(
        JSON.stringify({ sources }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (fetchError) {
      logEvent('fetch_error', { error: fetchError.message });
      throw fetchError;
    }
  } catch (error) {
    logEvent('unhandled_error', { 
      error: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        sources: [] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to determine source type based on URL
function determineSourceType(url: string): "academic" | "trusted" | "blog" | "unknown" {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('.edu') || 
      lowercaseUrl.includes('academic.') || 
      lowercaseUrl.includes('scholar.')) {
    return "academic";
  }
  
  if (lowercaseUrl.includes('news.') || 
      lowercaseUrl.includes('bbc.') || 
      lowercaseUrl.includes('reuters.') || 
      lowercaseUrl.includes('cnn.')) {
    return "trusted";
  }
  
  if (lowercaseUrl.includes('blog.') || 
      lowercaseUrl.includes('medium.') || 
      lowercaseUrl.includes('wordpress.')) {
    return "blog";
  }
  
  return "unknown";
}
