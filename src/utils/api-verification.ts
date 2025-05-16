
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VerificationResult {
  name: string;
  status: "success" | "error";
  message: string;
}

export async function verifySupabaseConnection(): Promise<VerificationResult> {
  try {
    // Test a simple select query on a public table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) throw new Error(error.message);
    
    return {
      name: "Supabase",
      status: "success",
      message: "Connection successful"
    };
  } catch (error) {
    console.error("Supabase connection error:", error);
    return {
      name: "Supabase",
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function verifyOpenAIConnection(): Promise<VerificationResult> {
  try {
    // Call the edge function that uses OpenAI
    const { data, error } = await supabase.functions.invoke('detect-ai-content', {
      body: { text: "This is a test message to verify the OpenAI API connection." }
    });
    
    if (error) throw new Error(error.message);
    
    // Check if we got a meaningful response that contains expected properties
    if (!data || data.error || !data.aiProbability) {
      throw new Error(data?.error || "Invalid response format from OpenAI");
    }
    
    return {
      name: "OpenAI",
      status: "success",
      message: "API key valid and connected"
    };
  } catch (error) {
    console.error("OpenAI connection error:", error);
    return {
      name: "OpenAI",
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function verifyGoogleCSEConnection(): Promise<VerificationResult> {
  try {
    // Call the edge function that uses Google CSE
    const { data, error } = await supabase.functions.invoke('search-sources', {
      body: { 
        query: "test search query", 
        limit: 1 
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Check if we got a meaningful response with search results
    if (!data || data.error || !Array.isArray(data.results)) {
      throw new Error(data?.error || "Invalid response format from Google CSE");
    }
    
    return {
      name: "Google CSE",
      status: "success",
      message: "API key valid and connected"
    };
  } catch (error) {
    console.error("Google CSE connection error:", error);
    return {
      name: "Google CSE",
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function verifyAllConnections(): Promise<VerificationResult[]> {
  return Promise.all([
    verifySupabaseConnection(),
    verifyOpenAIConnection(),
    verifyGoogleCSEConnection()
  ]);
}

export function displayVerificationResults(results: VerificationResult[]): void {
  results.forEach(result => {
    if (result.status === "success") {
      toast.success(`✅ ${result.name}: ${result.message}`);
      console.log(`✅ ${result.name}: ${result.message}`);
    } else {
      toast.error(`❌ ${result.name}: ${result.message}`);
      console.error(`❌ ${result.name}: ${result.message}`);
    }
  });
}
