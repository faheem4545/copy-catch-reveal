
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const reqBody = await req.json().catch(() => null);
    const { text, flaggedSources = [], options = {} } = reqBody || {};
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a non-empty string' }),
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

    // Extract flagged passages for focused rewriting
    const passages = flaggedSources.length > 0 
      ? flaggedSources.map((source: any) => source.text).filter(Boolean)
      : extractPassagesForRewriting(text);

    if (passages.length === 0) {
      // If no specific passages to rewrite, rewrite the entire text
      passages.push(text);
    }

    // Limit text length to avoid excessive API usage
    const processedPassages = passages.map(passage => 
      passage.length > 2000 ? passage.substring(0, 2000) + "..." : passage
    );

    // Generate rewriting suggestions for each passage
    const suggestions = await generateRewritingSuggestions(
      processedPassages,
      text,
      options,
      openAiKey
    );

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smart content rewriting function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorDetail: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to extract passages that likely need rewriting
function extractPassagesForRewriting(text: string): string[] {
  // Split text into sentences or paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length <= 1) {
    // If there's just one paragraph, split by sentences
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    // Group sentences into meaningful chunks
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 300) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  // If we have multiple paragraphs, use those as chunks
  return paragraphs;
}

// Generate rewriting suggestions using OpenAI
async function generateRewritingSuggestions(
  passages: string[],
  fullText: string,
  options: any,
  apiKey: string
): Promise<any[]> {
  const { 
    style = 'academic', 
    purpose = 'plagiarism-fix', 
    preserveKeyTerms = true, 
    academicDiscipline = '',
    targetReadingLevel = 'undergraduate' 
  } = options;
  
  // Limit to 3 passages to avoid excessive API usage
  const limitedPassages = passages.slice(0, 3);
  
  try {
    // Process each passage in parallel with error handling
    const suggestionPromises = limitedPassages.map(passage => 
      generateSuggestion(passage, style, purpose, preserveKeyTerms, academicDiscipline, targetReadingLevel, apiKey)
        .catch(error => ({
          original: passage,
          rewritten: "Error generating suggestion",
          explanation: `Error: ${error.message}`,
          error: true
        }))
    );
    
    return await Promise.all(suggestionPromises);
  } catch (error) {
    console.error("Error processing passages:", error);
    throw error;
  }
}

// Individual suggestion generation with proper error handling
async function generateSuggestion(
  passage: string,
  style: string,
  purpose: string,
  preserveKeyTerms: boolean,
  academicDiscipline: string,
  targetReadingLevel: string,
  apiKey: string
): Promise<any> {
  try {
    // Style-specific instructions
    const styleInstructions = getStyleInstructions(style);
    
    // Purpose-specific instructions
    const purposeInstructions = getPurposeInstructions(purpose);
    
    // Reading level instructions
    const readingLevelInstructions = getReadingLevelInstructions(targetReadingLevel);
    
    const disciplineNote = academicDiscipline 
      ? `This is for the academic discipline of ${academicDiscipline}.` 
      : '';
    
    const keyTermsNote = preserveKeyTerms 
      ? "Preserve key terms, proper nouns, and essential discipline-specific terminology." 
      : "Feel free to use synonyms for all terms to maximize originality.";
      
    const systemPrompt = `You are an expert academic writer and editor specializing in helping users rewrite content to avoid plagiarism while maintaining academic integrity. ${disciplineNote}`;
    
    const userPrompt = `Please rewrite the following text passage:
    
"${passage}"

Instructions:
${styleInstructions}
${purposeInstructions}
${readingLevelInstructions}
${keyTermsNote}

Please structure your response in this format:
"Rewritten version: [Your rewritten text here]

Explanation: [Brief explanation of changes made]"`;

    // Call OpenAI API with error handling and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using the modern, more efficient model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData) || 'Unknown error'}`);
      }

      const responseData = await response.json();
      const aiResponse = responseData.choices[0].message?.content || "";
      
      // Extract rewritten content and explanation
      const result = parseResponse(aiResponse, passage);
      return {
        original: passage,
        ...result
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error(`Error processing passage: ${error}`);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

// Helper functions for instructions
function getStyleInstructions(style: string): string {
  switch (style) {
    case 'academic':
      return "Use formal academic language, proper citations if mentioned, and discipline-specific terminology. Maintain a scholarly tone.";
    case 'technical':
      return "Use precise technical language and industry-standard terminology. Focus on clarity and accuracy.";
    case 'casual':
      return "Use a conversational tone while maintaining clarity. Simplify complex concepts without losing meaning.";
    case 'creative':
      return "Use more engaging, varied language with appropriate metaphors or analogies to explain concepts creatively.";
    default:
      return "Use formal academic language appropriate for scholarly writing.";
  }
}

function getPurposeInstructions(purpose: string): string {
  switch (purpose) {
    case 'plagiarism-fix':
      return "Completely rephrase the text to avoid similarity with potential sources while preserving the exact same meaning.";
    case 'clarity':
      return "Improve the clarity and readability of the text while maintaining its meaning.";
    case 'simplification':
      return "Simplify complex concepts and language for easier understanding.";
    case 'elaboration':
      return "Expand on the ideas in the text with more detail and explanation.";
    default:
      return "Completely rephrase the text to avoid similarity with potential sources while preserving the exact same meaning.";
  }
}

function getReadingLevelInstructions(level: string): string {
  switch (level) {
    case 'elementary':
      return "Use simple vocabulary and short sentences suitable for elementary school readers.";
    case 'high-school':
      return "Use vocabulary and sentence structures appropriate for high school students.";
    case 'undergraduate':
      return "Use vocabulary and concepts appropriate for undergraduate college students.";
    case 'graduate':
      return "Use advanced vocabulary and complex concepts suitable for graduate-level readers.";
    case 'expert':
      return "Use specialized terminology and complex concepts appropriate for experts in the field.";
    default:
      return "Use vocabulary and concepts appropriate for undergraduate college students.";
  }
}

// Parse the AI response to extract rewritten text and explanation
function parseResponse(aiResponse: string, originalText: string): { rewritten: string; explanation: string; similarityReduction: number } {
  try {
    // Try to parse structured response
    const rewrittenMatch = aiResponse.match(/(?:Rewritten version:|Rewritten text:)([\s\S]+?)(?:Explanation:|$)/i);
    let rewritten = '';
    
    if (rewrittenMatch && rewrittenMatch[1]) {
      rewritten = rewrittenMatch[1].trim();
    } else {
      // If no clear structure, use the first half as rewritten text
      rewritten = aiResponse.substring(0, Math.floor(aiResponse.length / 2)).trim();
    }
    
    const explanationMatch = aiResponse.match(/(?:Explanation:)([\s\S]+)/i);
    let explanation = '';
    
    if (explanationMatch && explanationMatch[1]) {
      explanation = explanationMatch[1].trim();
    } else {
      // If no explanation found, use the second half as explanation
      explanation = aiResponse.substring(Math.floor(aiResponse.length / 2)).trim();
    }
    
    // Calculate an approximate similarity reduction
    const similarityReduction = calculateApproximateSimilarityReduction(originalText, rewritten);
    
    return {
      rewritten,
      explanation,
      similarityReduction
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      rewritten: aiResponse || "Error parsing response",
      explanation: "There was an error processing the AI response",
      similarityReduction: 0
    };
  }
}

// Calculate a simple similarity reduction estimate
function calculateApproximateSimilarityReduction(original: string, rewritten: string): number {
  // This is a simple approximation algorithm
  // In production, a more sophisticated algorithm or embedding comparison would be used
  try {
    const originalWords = new Set(original.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const rewrittenWords = new Set(rewritten.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    // Find common words
    let commonCount = 0;
    for (const word of rewrittenWords) {
      if (originalWords.has(word)) {
        commonCount++;
      }
    }
    
    const originalCount = originalWords.size;
    if (originalCount === 0) return 0;
    
    const commonRatio = commonCount / originalCount;
    const similarityReduction = Math.floor((1 - commonRatio) * 100);
    
    // Bound the result between 20 and 90 percent
    return Math.min(90, Math.max(20, similarityReduction));
  } catch (error) {
    console.error("Error calculating similarity reduction:", error);
    return 50; // Default fallback
  }
}
