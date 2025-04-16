
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
}

interface SourceType {
  type: "academic" | "trusted" | "blog" | "unknown";
  url: string;
  title: string;
  snippet: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid query parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CSE_API_KEY');
    // Using the CSE ID you provided
    const GOOGLE_CSE_ID = 'a52863c5312114c0a';

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing API credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', GOOGLE_API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_CSE_ID);
    searchUrl.searchParams.append('q', query);

    console.log(`Searching for: "${query}"`);
    
    const response = await fetch(searchUrl.toString());
    const data: SearchResponse = await response.json();
    
    if (!response.ok) {
      console.error('Google API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch search results', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const sources: SourceType[] = (data.items || []).map(item => {
      // Determine source type based on URL or content
      let type: "academic" | "trusted" | "blog" | "unknown" = "unknown";
      const url = item.link.toLowerCase();
      
      // Academic sources check
      if (url.includes('.edu') || 
          url.includes('.ac.') ||
          url.includes('scholar.') ||
          url.includes('academic.') ||
          url.includes('research.') || 
          url.includes('sciencedirect.com') ||
          url.includes('jstor.org') ||
          url.includes('springer.com')) {
        type = "academic";
      }
      // Trusted publications check
      else if (url.includes('nytimes.com') ||
              url.includes('washingtonpost.com') ||
              url.includes('bbc.') ||
              url.includes('reuters.com') ||
              url.includes('npr.org') ||
              url.includes('nationalgeographic.com') ||
              url.includes('economist.com') ||
              url.includes('scientificamerican.com')) {
        type = "trusted";  
      }
      // Blog sources check
      else if (url.includes('blog.') ||
              url.includes('wordpress.') ||
              url.includes('medium.com') ||
              url.includes('blogger.') ||
              url.includes('tumblr.') ||
              url.includes('forum.')) {
        type = "blog";
      }

      return {
        url: item.link,
        title: item.title,
        snippet: item.snippet || "",
        type
      };
    });

    console.log(`Found ${sources.length} sources`);
    
    return new Response(
      JSON.stringify({ sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in search-sources function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
