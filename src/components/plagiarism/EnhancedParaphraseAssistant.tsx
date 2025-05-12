
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParaphrasing } from "@/hooks/use-paraphrasing";
import { Loader2, RotateCcw, Wand2, Sparkles, Lightbulb, BookOpen, Briefcase } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ParaphraseStyle = "creative" | "formal" | "simple" | "academic";
type SeverityLevel = "low" | "medium" | "high";

interface EnhancedParaphraseAssistantProps {
  initialText?: string;
  textToParaphrase?: string;
  originalContext?: string;
  onParaphrased?: (original: string, paraphrased: string) => void;
  onClose?: () => void;
  onSelect?: (text: string) => void;
}

interface ParaphraseResult {
  text: string;
  style: ParaphraseStyle;
}

const EnhancedParaphraseAssistant: React.FC<EnhancedParaphraseAssistantProps> = ({
  initialText = "",
  textToParaphrase = "",
  originalContext = "",
  onParaphrased,
  onClose,
  onSelect
}) => {
  const [text, setText] = useState(initialText || textToParaphrase);
  const [context, setContext] = useState(originalContext);
  const [severity, setSeverity] = useState<SeverityLevel>("medium");
  const [selectedStyle, setSelectedStyle] = useState<ParaphraseStyle>("formal");
  const [results, setResults] = useState<Record<ParaphraseStyle, string>>({
    creative: "",
    formal: "",
    simple: "",
    academic: ""
  });
  
  const { paraphraseText, isParaphrasing, paraphraseResult, paraphraseError, clearResult } = useParaphrasing();

  const handleParaphrase = async () => {
    if (!text.trim()) return;
    
    try {
      // First generate the formal style (default)
      const formalResult = await paraphraseText(text, context, severity);
      if (formalResult) {
        setResults(prev => ({ ...prev, formal: formalResult.paraphrased }));
      }
      
      // Generate other styles
      const simpleResult = await paraphraseText(
        text, 
        context, 
        "low", 
        "simple"
      );
      if (simpleResult) {
        setResults(prev => ({ ...prev, simple: simpleResult.paraphrased }));
      }
      
      const creativeResult = await paraphraseText(
        text, 
        context, 
        "high", 
        "creative"
      );
      if (creativeResult) {
        setResults(prev => ({ ...prev, creative: creativeResult.paraphrased }));
      }
      
      const academicResult = await paraphraseText(
        text, 
        context, 
        "medium", 
        "academic"
      );
      if (academicResult) {
        setResults(prev => ({ ...prev, academic: academicResult.paraphrased }));
      }
      
      if (formalResult && onParaphrased) {
        onParaphrased(formalResult.original, formalResult.paraphrased);
      }
    } catch (error) {
      console.error("Error in enhanced paraphrasing assistant:", error);
    }
  };

  const handleReset = () => {
    setText("");
    setContext("");
    setResults({
      creative: "",
      formal: "",
      simple: "",
      academic: ""
    });
    clearResult();
  };
  
  const handleSelectParaphrased = () => {
    if (onSelect) {
      onSelect(results[selectedStyle] || "");
    }
    if (onClose) {
      onClose();
    }
  };

  // Check if the error is related to quota or rate limiting
  const isQuotaError = paraphraseError?.message?.toLowerCase().includes('quota') || 
                       paraphraseError?.message?.toLowerCase().includes('rate limit') ||
                       paraphraseError?.message?.toLowerCase().includes('429');
  
  const hasResults = Object.values(results).some(result => result.length > 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="mr-2 h-5 w-5" />
          Enhanced AI Paraphrasing Assistant
        </CardTitle>
        <CardDescription>
          Rewrite text in multiple styles to avoid plagiarism while preserving meaning
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

        {hasResults && (
          <div className="pt-4">
            <Tabs defaultValue="formal" onValueChange={(value) => setSelectedStyle(value as ParaphraseStyle)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="formal">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Formal
                </TabsTrigger>
                <TabsTrigger value="academic">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Academic
                </TabsTrigger>
                <TabsTrigger value="simple">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Simple
                </TabsTrigger>
                <TabsTrigger value="creative">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Creative
                </TabsTrigger>
              </TabsList>
              
              {(["formal", "academic", "simple", "creative"] as ParaphraseStyle[]).map((style) => (
                <TabsContent key={style} value={style}>
                  <div className="bg-secondary/30 p-3 rounded-md border whitespace-pre-wrap min-h-[100px]">
                    {results[style] || (
                      <span className="text-muted-foreground">
                        {isParaphrasing ? "Generating..." : "No paraphrased content for this style yet"}
                      </span>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleReset} disabled={isParaphrasing}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          {hasResults && onSelect && (
            <Button variant="outline" onClick={handleSelectParaphrased}>
              Use This Version
            </Button>
          )}
        </div>
        <Button onClick={handleParaphrase} disabled={!text.trim() || isParaphrasing}>
          {isParaphrasing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Paraphrasing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" /> Generate All Styles
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedParaphraseAssistant;
