
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
    const { text, context = "", severity = "medium", style = "formal" } = await req.json();
    
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

    // Adjust instructions based on severity and style
    let paraphraseInstructions = "";
    
    // Base instructions based on severity
    let severityInstructions = "";
    switch(severity) {
      case "high":
        severityInstructions = "Completely rewrite this text while preserving the core meaning. Use different vocabulary, sentence structures, and organization.";
        break;
      case "medium":
        severityInstructions = "Rewrite this text to reduce similarity while maintaining the original meaning. Change vocabulary and sentence structure where possible.";
        break;
      case "low":
        severityInstructions = "Lightly revise this text to make it more original. Keep key terminology intact but adjust phrasing and structure.";
        break;
      default:
        severityInstructions = "Rewrite this text to reduce similarity while maintaining the original meaning.";
    }
    
    // Additional style-specific instructions
    let styleInstructions = "";
    switch(style) {
      case "formal":
        styleInstructions = "Use formal language, professional tone, and well-structured sentences suitable for business or academic contexts.";
        break;
      case "creative":
        styleInstructions = "Use vivid, engaging language with creative metaphors and expressive vocabulary to make the text more interesting.";
        break;
      case "simple":
        styleInstructions = "Use clear, straightforward language with short sentences and common vocabulary. Aim for high readability.";
        break;
      case "academic":
        styleInstructions = "Use scholarly language, discipline-specific terminology, and complex sentence structures appropriate for academic papers.";
        break;
      default:
        styleInstructions = "Use professional language appropriate for business or academic contexts.";
    }
    
    paraphraseInstructions = `${severityInstructions} ${styleInstructions}`;

    // Add context if provided
    const prompt = context 
      ? `Context: ${context}\n\nOriginal text: "${text}"\n\n${paraphraseInstructions}`
      : `Original text: "${text}"\n\n${paraphraseInstructions}`;

    try {
      // Use fetch directly instead of the OpenAI client library which is causing issues
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
              content: "You are an academic paraphrasing assistant. Your job is to help users avoid plagiarism by rewriting text while preserving the original meaning. Provide well-structured, natural sounding alternatives that effectively communicate the same information."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
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
        
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const responseData = await response.json();
      const paraphrasedText = responseData.choices[0].message?.content || "";

      // Since API quota is limited, let's provide a simpler explanation instead of making another API call
      const explanation = `Text has been paraphrased in ${style} style with ${severity} intensity to reduce similarity while maintaining original meaning.`;
      
      return new Response(
        JSON.stringify({ 
          original: text,
          paraphrased: paraphrasedText, 
          explanation: explanation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return new Response(
        JSON.stringify({ error: "Failed to connect to OpenAI API. Please try again later." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in paraphrase function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
