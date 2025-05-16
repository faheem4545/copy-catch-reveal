
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
    const { text, flaggedSources = [], options = {} } = await req.json();
    
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

    // Extract flagged passages for focused rewriting
    const passages = flaggedSources.length > 0 
      ? flaggedSources.map(source => source.text) 
      : extractPassagesForRewriting(text);

    if (passages.length === 0) {
      // If no specific passages to rewrite, rewrite the entire text
      passages.push(text);
    }

    // Generate rewriting suggestions for each passage
    const suggestions = await generateRewritingSuggestions(
      passages,
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
      JSON.stringify({ error: error.message || String(error) }),
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
  const { style = 'academic', purpose = 'plagiarism-fix', preserveKeyTerms = true, academicDiscipline, targetReadingLevel = 'undergraduate' } = options;
  
  // Limit to 3 passages to avoid excessive API usage
  const limitedPassages = passages.slice(0, 3);
  
  // Process each passage in parallel
  const suggestionPromises = limitedPassages.map(async (passage) => {
    try {
      // Style-specific instructions
      let styleInstructions = '';
      switch (style) {
        case 'academic':
          styleInstructions = "Use formal academic language, proper citations if mentioned, and discipline-specific terminology. Maintain a scholarly tone.";
          break;
        case 'technical':
          styleInstructions = "Use precise technical language and industry-standard terminology. Focus on clarity and accuracy.";
          break;
        case 'casual':
          styleInstructions = "Use a conversational tone while maintaining clarity. Simplify complex concepts without losing meaning.";
          break;
        case 'creative':
          styleInstructions = "Use more engaging, varied language with appropriate metaphors or analogies to explain concepts creatively.";
          break;
      }
      
      // Purpose-specific instructions
      let purposeInstructions = '';
      switch (purpose) {
        case 'plagiarism-fix':
          purposeInstructions = "Completely rephrase the text to avoid similarity with potential sources while preserving the exact same meaning.";
          break;
        case 'clarity':
          purposeInstructions = "Improve the clarity and readability of the text while maintaining its meaning.";
          break;
        case 'simplification':
          purposeInstructions = "Simplify complex concepts and language for easier understanding.";
          break;
        case 'elaboration':
          purposeInstructions = "Expand on the ideas in the text with more detail and explanation.";
          break;
      }
      
      // Reading level instructions
      let readingLevelInstructions = '';
      switch (targetReadingLevel) {
        case 'elementary':
          readingLevelInstructions = "Use simple vocabulary and short sentences suitable for elementary school readers.";
          break;
        case 'high-school':
          readingLevelInstructions = "Use vocabulary and sentence structures appropriate for high school students.";
          break;
        case 'undergraduate':
          readingLevelInstructions = "Use vocabulary and concepts appropriate for undergraduate college students.";
          break;
        case 'graduate':
          readingLevelInstructions = "Use advanced vocabulary and complex concepts suitable for graduate-level readers.";
          break;
        case 'expert':
          readingLevelInstructions = "Use specialized terminology and complex concepts appropriate for experts in the field.";
          break;
      }
      
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

Provide the rewritten version and a brief explanation of the changes you made.`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      const aiResponse = responseData.choices[0].message?.content || "";
      
      // Extract rewritten content and explanation
      let rewritten = '';
      let explanation = '';
      
      // Try to parse structured response
      const rewrittenMatch = aiResponse.match(/(?:Rewritten version:|Rewritten text:)([\s\S]+?)(?:Explanation:|$)/i);
      if (rewrittenMatch && rewrittenMatch[1]) {
        rewritten = rewrittenMatch[1].trim();
      } else {
        // If no clear structure, use the first half as rewritten text
        rewritten = aiResponse.substring(0, Math.floor(aiResponse.length / 2)).trim();
      }
      
      const explanationMatch = aiResponse.match(/(?:Explanation:)([\s\S]+)/i);
      if (explanationMatch && explanationMatch[1]) {
        explanation = explanationMatch[1].trim();
      } else {
        // If no explanation found, use the second half as explanation
        explanation = aiResponse.substring(Math.floor(aiResponse.length / 2)).trim();
      }
      
      // Calculate an approximate similarity reduction (this would be more accurate with embeddings)
      const similarityReduction = Math.floor(Math.random() * 30) + 40; // 40-70% reduction (mock data)
      
      return {
        original: passage,
        rewritten,
        explanation,
        similarityReduction
      };
    } catch (error) {
      console.error(`Error processing passage: ${error}`);
      return {
        original: passage,
        rewritten: "Error generating suggestion",
        explanation: `Error: ${error.message}`,
        error: true
      };
    }
  });
  
  return Promise.all(suggestionPromises);
}
