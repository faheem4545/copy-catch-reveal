
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

interface SourceType {
  type: "academic" | "trusted" | "blog" | "unknown";
  url: string;
  title: string;
  snippet: string;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per window

// In-memory rate limiting store
const ipRequests: Record<string, { count: number; resetAt: number }> = {};

// Default CSE ID to use if none provided
const DEFAULT_CSE_ID = 'a52863c5312114c0a';

// NLP Utility Functions
function tokenize(text: string): string[] {
  // Simple tokenization - split by spaces and remove punctuation
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) {
    console.log("Warning: Empty text provided for similarity calculation");
    return 0;
  }
  
  try {
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);
    
    if (tokens1.length === 0 || tokens2.length === 0) {
      return 0;
    }
    
    // Create sets for intersection
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    // Find intersection
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    // Jaccard similarity coefficient
    const similarity = intersection.size / (set1.size + set2.size - intersection.size);
    return similarity;
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return 0;
  }
}

function extractKeyPhrases(text: string): string[] {
  try {
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
  } catch (error) {
    console.error("Error extracting key phrases:", error);
    return [];
  }
}

// Log helper function
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

// Mock search results when API key is not available or search fails
function getMockSearchResults(query: string): any[] {
  return [
    {
      url: "https://example.edu/academic-paper",
      title: "Recent Advances in Natural Language Processing",
      snippet: "This paper discusses recent developments in NLP technologies including " + query,
      type: "academic",
      similarity: Math.random() * 30 + 50
    },
    {
      url: "https://trusted-news.com/article",
      title: "Understanding Modern Technology",
      snippet: "An in-depth analysis of " + query + " and its implications for society",
      type: "trusted",
      similarity: Math.random() * 20 + 40
    },
    {
      url: "https://tech-blog.com/insights",
      title: "Tech Insights: " + query.charAt(0).toUpperCase() + query.slice(1),
      snippet: "Our blog explores the fascinating world of " + query,
      type: "blog",
      similarity: Math.random() * 40 + 30
    }
  ];
}

// Check rate limit for an IP
function checkRateLimit(ip: string): { allowed: boolean; remainingRequests: number; resetAt: number } {
  const now = Date.now();
  
  // Use in-memory rate limiting
  if (!ipRequests[ip] || now > ipRequests[ip].resetAt) {
    ipRequests[ip] = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: ipRequests[ip].resetAt };
  } else if (ipRequests[ip].count < RATE_LIMIT_MAX_REQUESTS) {
    ipRequests[ip].count++;
    return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS - ipRequests[ip].count, resetAt: ipRequests[ip].resetAt };
  } else {
    return { allowed: false, remainingRequests: 0, resetAt: ipRequests[ip].resetAt };
  }
}

serve(async (req) => {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  
  logEvent('request_received', { 
    id: requestId,
    ip: clientIP,
    method: req.method,
    path: new URL(req.url).pathname
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      logEvent('rate_limited', { 
        id: requestId,
        ip: clientIP,
        resetAt: new Date(rateLimitResult.resetAt).toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          message: 'Too many requests, please try again later.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
          sources: [] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': `${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)}` }, 
          status: 429 
        }
      );
    }

    // Add rate limit headers to all responses
    const commonHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remainingRequests.toString(),
      'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt / 1000).toString()
    };

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      logEvent('parse_error', { id: requestId, error: parseError.message });
      return new Response(
        JSON.stringify({ error: 'Invalid request body', sources: [] }),
        { headers: commonHeaders, status: 400 }
      );
    }
    
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      logEvent('validation_error', { id: requestId, error: 'Invalid query parameter' });
      return new Response(
        JSON.stringify({ error: 'Invalid query parameter', sources: [] }),
        { headers: commonHeaders, status: 400 }
      );
    }

    // Trim very long queries to prevent abuse
    const trimmedQuery = query.substring(0, 1000);
    if (trimmedQuery.length < query.length) {
      logEvent('query_trimmed', { id: requestId, originalLength: query.length, trimmedLength: trimmedQuery.length });
    }

    // Get API key from environment with fallback
    let GOOGLE_API_KEY = Deno.env.get('GOOGLE_CSE_API_KEY');
    
    // Log API key status (presence/absence, not the actual key)
    logEvent('api_key_status', { 
      keyPresent: !!GOOGLE_API_KEY,
      keyLength: GOOGLE_API_KEY ? GOOGLE_API_KEY.length : 0
    });
    
    if (!GOOGLE_API_KEY) {
      logEvent('api_key_missing', { 
        message: "Google CSE API key not found in environment variables, using mock results" 
      });
    }

    // Always use the default CSE ID, ignoring any user-provided one for security
    const GOOGLE_CSE_ID = DEFAULT_CSE_ID; 
    
    logEvent('cse_id_status', { 
      idPresent: true,
      idSource: "hardcoded default",
      idValue: GOOGLE_CSE_ID
    });

    // If API key is missing, use mock results
    if (!GOOGLE_API_KEY) {
      logEvent('using_mock_results', { reason: 'API key missing' });
      
      const mockSources = getMockSearchResults(trimmedQuery);
      const sortedSources = mockSources.sort((a, b) => b.similarity - a.similarity);
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      logEvent('request_completed_with_mock', { 
        id: requestId, 
        processingTimeMs: processingTime,
        sourceCount: sortedSources.length,
        cseIdUsed: GOOGLE_CSE_ID
      });
      
      return new Response(
        JSON.stringify({ 
          sources: sortedSources.map(({ similarity, ...source }) => ({
            ...source,
            matchPercentage: similarity
          })),
          processingTimeMs: Math.round(processingTime),
          requestId,
          note: "Using simulated results - API key not configured. To fix this, add GOOGLE_CSE_API_KEY as a secret in your Supabase project."
        }),
        { headers: commonHeaders, status: 200 }
      );
    }

    // Extract key phrases for better search
    const keyPhrases = extractKeyPhrases(trimmedQuery);
    logEvent('key_phrases_extracted', { id: requestId, keyPhrases });
    
    // Use the original query along with top key phrases for better search
    const searchQuery = `${trimmedQuery} ${keyPhrases.slice(0, 2).join(' ')}`;
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', GOOGLE_API_KEY);
    searchUrl.searchParams.append('cx', GOOGLE_CSE_ID);
    searchUrl.searchParams.append('q', searchQuery);

    logEvent('search_started', { 
      id: requestId, 
      searchQuery, 
      cseId: GOOGLE_CSE_ID 
    });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(searchUrl.toString(), { 
        signal: controller.signal 
      }).finally(() => clearTimeout(timeoutId));
      
      const data: SearchResponse = await response.json();
      
      if (!response.ok || data.error) {
        logEvent('api_error', { 
          id: requestId, 
          status: response.status, 
          error: data.error || response.statusText 
        });

        // If Google API fails, fall back to mock results
        const mockSources = getMockSearchResults(trimmedQuery);
        const sortedSources = mockSources.sort((a, b) => b.similarity - a.similarity);
        
        return new Response(
          JSON.stringify({ 
            warning: 'Search API returned an error, using fallback results', 
            error: data.error?.message || response.statusText,
            sources: sortedSources.map(({ similarity, ...source }) => ({
              ...source,
              matchPercentage: similarity
            }))
          }),
          { headers: commonHeaders, status: 200 }
        );
      }

      const totalResults = parseInt(data.searchInformation?.totalResults || '0', 10);
      logEvent('search_completed', { 
        id: requestId, 
        totalResults,
        resultCount: data.items?.length || 0
      });

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
        const similarity = calculateSimilarity(trimmedQuery, item.snippet || "");

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

      logEvent('processing_completed', { 
        id: requestId, 
        processedSourceCount: sortedSources.length,
        topSimilarity: sortedSources.length > 0 ? sortedSources[0].similarity : 0
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      logEvent('request_completed', { 
        id: requestId, 
        processingTimeMs: processingTime,
        sourceCount: sortedSources.length
      });
      
      return new Response(
        JSON.stringify({ 
          sources: sortedSources.map(({ similarity, ...source }) => ({
            ...source,
            matchPercentage: similarity  // Convert similarity score to matchPercentage for frontend
          })),
          processingTimeMs: Math.round(processingTime),
          requestId
        }),
        { headers: commonHeaders, status: 200 }
      );
    } catch (fetchError) {
      const isAbortError = fetchError.name === 'AbortError';
      
      logEvent('fetch_error', { 
        id: requestId, 
        error: fetchError.message,
        isTimeout: isAbortError
      });
      
      // If fetch fails, provide mock results as fallback
      const mockSources = getMockSearchResults(trimmedQuery);
      const sortedSources = mockSources.sort((a, b) => b.similarity - a.similarity);
      
      return new Response(
        JSON.stringify({ 
          warning: isAbortError ? 'Search request timed out' : 'Error calling search API, using fallback results', 
          error: fetchError.message,
          sources: sortedSources.map(({ similarity, ...source }) => ({
            ...source,
            matchPercentage: similarity
          }))
        }),
        { headers: commonHeaders, status: 200 }
      );
    }
  } catch (error) {
    logEvent('unhandled_error', { 
      id: requestId, 
      error: error.message,
      stack: error.stack
    });
    
    // Even for unhandled errors, provide a graceful fallback response
    const mockSources = getMockSearchResults("error fallback");
    
    return new Response(
      JSON.stringify({ 
        warning: 'Internal server error, using fallback results', 
        error: error.message,
        sources: mockSources.map(({ similarity, ...source }) => ({
          ...source,
          matchPercentage: similarity
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
