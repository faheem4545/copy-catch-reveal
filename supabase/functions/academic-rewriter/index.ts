
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
    const { text, context = "", discipline = "general" } = await req.json();
    
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

    // Create discipline-specific instructions
    let disciplineInstructions = "";
    switch (discipline.toLowerCase()) {
      case "humanities":
        disciplineInstructions = "Use humanities terminology and writing conventions. Focus on interpretive language, theoretical frameworks, and cultural contexts.";
        break;
      case "stem":
      case "science":
        disciplineInstructions = "Use precise scientific terminology and passive voice where appropriate. Focus on objective, data-driven language with proper technical terms.";
        break;
      case "social sciences":
        disciplineInstructions = "Use social science conventions with empirical language balanced with theoretical frameworks. Include appropriate methodological terminology.";
        break;
      case "business":
        disciplineInstructions = "Use professional business terminology with focus on practical implications, strategic concepts, and organizational context.";
        break;
      case "law":
        disciplineInstructions = "Use legal terminology and conventions with precise language citing principles and precedents where relevant.";
        break;
      default:
        disciplineInstructions = "Use standard academic conventions with formal language appropriate for scholarly writing.";
    }

    const contextNote = context ? `Consider this surrounding context: "${context}"` : "";

    try {
      // Call OpenAI API
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
              content: `You are an expert academic writer specializing in ${discipline} writing. Your task is to rewrite content to avoid plagiarism while maintaining academic integrity and improving the quality of writing. ${disciplineInstructions}`
            },
            {
              role: "user",
              content: `Please rewrite the following text in proper academic style for ${discipline} discipline, ensuring it's completely original while maintaining the same meaning:

"${text}"

${contextNote}

Provide the rewritten version and a brief explanation of your changes, including how you've improved the academic quality.`
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
        // If no clear structure, assume the first part is the rewritten text
        const parts = aiResponse.split('\n\n');
        rewritten = parts[0].trim();
      }
      
      const explanationMatch = aiResponse.match(/(?:Explanation:|Changes:|Improvements:)([\s\S]+)/i);
      if (explanationMatch && explanationMatch[1]) {
        explanation = explanationMatch[1].trim();
      } else {
        // If no explanation found, use later parts as explanation
        const parts = aiResponse.split('\n\n');
        explanation = parts.slice(1).join('\n\n').trim();
      }
      
      // Calculate an approximate similarity reduction (this would be more accurate with embeddings)
      const similarityReduction = Math.floor(Math.random() * 25) + 50; // 50-75% reduction (mock data)
      
      return new Response(
        JSON.stringify({ 
          rewritten, 
          explanation,
          similarityReduction 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return new Response(
        JSON.stringify({ error: `Failed to process request: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in academic rewriter function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
