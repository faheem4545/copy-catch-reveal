
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useParaphrasing } from "@/hooks/use-paraphrasing";
import { Loader2, RotateCcw, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SeverityLevel = "low" | "medium" | "high";

interface ParaphraseAssistantProps {
  textToParaphrase?: string;
  originalContext?: string;
  onParaphrased?: (original: string, paraphrased: string) => void;
}

const ParaphraseAssistant: React.FC<ParaphraseAssistantProps> = ({
  textToParaphrase = "",
  originalContext = "",
  onParaphrased
}) => {
  const [text, setText] = useState(textToParaphrase);
  const [context, setContext] = useState(originalContext);
  const [severity, setSeverity] = useState<SeverityLevel>("medium");
  const { paraphraseText, isParaphrasing, paraphraseResult, paraphraseError, clearResult } = useParaphrasing();

  const handleParaphrase = async () => {
    if (!text.trim()) return;
    
    try {
      const result = await paraphraseText(text, context, severity);
      if (result && onParaphrased) {
        onParaphrased(result.original, result.paraphrased);
      }
    } catch (error) {
      console.error("Error in paraphrasing assistant:", error);
    }
  };

  const handleReset = () => {
    setText("");
    setContext("");
    clearResult();
  };

  // Check if the error is related to quota or rate limiting
  const isQuotaError = paraphraseError?.message?.toLowerCase().includes('quota') || 
                       paraphraseError?.message?.toLowerCase().includes('rate limit') ||
                       paraphraseError?.message?.toLowerCase().includes('429');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="mr-2 h-5 w-5" />
          AI Paraphrasing Assistant
        </CardTitle>
        <CardDescription>
          Rewrite text to avoid plagiarism while preserving meaning
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {paraphraseError && (
          <Alert variant={isQuotaError ? "destructive" : "default"}>
            <AlertTitle>
              {isQuotaError ? "API Quota Exceeded" : "Error"}
            </AlertTitle>
            <AlertDescription>
              {isQuotaError 
                ? "OpenAI API quota exceeded. Please try again later or check your billing details."
                : "An error occurred while paraphrasing. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Text to paraphrase</label>
          <Textarea
            placeholder="Enter text that needs paraphrasing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Original context (optional)</label>
          <Textarea
            placeholder="Enter surrounding context to improve paraphrasing quality..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Paraphrasing intensity</label>
          <div className="flex space-x-2">
            <Button
              variant={severity === "low" ? "default" : "outline"}
              onClick={() => setSeverity("low")}
              size="sm"
            >
              Light
            </Button>
            <Button
              variant={severity === "medium" ? "default" : "outline"}
              onClick={() => setSeverity("medium")}
              size="sm"
            >
              Medium
            </Button>
            <Button
              variant={severity === "high" ? "default" : "outline"}
              onClick={() => setSeverity("high")}
              size="sm"
            >
              Strong
            </Button>
          </div>
        </div>

        {paraphraseResult && (
          <div>
            <label className="block text-sm font-medium mb-2">Paraphrased result</label>
            <div className="bg-secondary/50 p-3 rounded-md whitespace-pre-wrap">
              {paraphraseResult.paraphrased}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={handleReset} disabled={isParaphrasing}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleParaphrase} disabled={!text.trim() || isParaphrasing}>
          {isParaphrasing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Paraphrasing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" /> Paraphrase
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParaphraseAssistant;
