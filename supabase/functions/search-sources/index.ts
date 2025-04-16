
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
  error?: {
    code: number;
    message: string;
  };
}

interface SourceType {
  type: "academic" | "trusted" | "blog" | "unknown";
  url: string;
  title: string;
  snippet: string;
}

// NLP Utility Functions
function tokenize(text: string): string[] {
  // Simple tokenization - split by spaces and remove punctuation
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Create sets for intersection
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  // Find intersection
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  
  // Jaccard similarity coefficient
  const similarity = intersection.size / (set1.size + set2.size - intersection.size);
  return similarity;
}

function extractKeyPhrases(text: string): string[] {
  // Simple key phrase extraction based on token frequency
  const tokens = tokenize(text);
  const tokenFrequency: Record<string, number> = {};
  
  tokens.forEach(token => {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  });
  
  // Get top phrases by frequency
  return Object.entries(tokenFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
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
        JSON.stringify({ error: 'Invalid query parameter', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CSE_API_KEY');
    const GOOGLE_CSE_ID = 'a52863c5312114c0a'; // Using the provided CSE ID

    if (!GOOGLE_API_KEY) {
      console.log('Warning: Missing Google API key');
      return new Response(
        JSON.stringify({ 
          warning: 'API credentials not configured', 
          sources: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Extract key phrases for better search
    const keyPhrases = extractKeyPhrases(query);
    console.log(`Key phrases: ${keyPhrases.join(', ')}`);
    
    // Use the original query along with top key phrases for better search
    const searchQuery = `${query} ${keyPhrases.slice(0, 2).join(' ')}`;
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', GOOGLE_API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_CSE_ID);
    searchUrl.searchParams.append('q', searchQuery);

    console.log(`Searching for: "${searchQuery}"`);
    
    try {
      const response = await fetch(searchUrl.toString());
      const data: SearchResponse = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Google API error:', data.error || response.statusText);
        return new Response(
          JSON.stringify({ warning: 'Search API returned an error', sources: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      const sources: (SourceType & { similarity: number })[] = (data.items || []).map(item => {
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

        // Calculate text similarity between query and snippet
        const similarity = calculateSimilarity(query, item.snippet || "");

        return {
          url: item.link,
          title: item.title,
          snippet: item.snippet || "",
          type,
          similarity: parseFloat((similarity * 100).toFixed(2))
        };
      });

      // Sort sources by similarity
      const sortedSources = sources.sort((a, b) => b.similarity - a.similarity);

      console.log(`Found ${sortedSources.length} sources`);
      
      return new Response(
        JSON.stringify({ 
          sources: sortedSources.map(({ similarity, ...source }) => ({
            ...source,
            matchPercentage: similarity  // Convert similarity score to matchPercentage for frontend
          })) 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ warning: 'Error calling search API', sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in search-sources function:', error);
    return new Response(
      JSON.stringify({ warning: 'Internal server error', sources: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
