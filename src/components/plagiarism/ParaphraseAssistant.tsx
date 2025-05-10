
import React, { useState } from "react";
import { useParaphrasing } from "@/hooks/use-paraphrasing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRight, Copy, Wand2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParaphraseAssistantProps {
  initialText?: string;
  onClose?: () => void;
  onSelect?: (paraphrasedText: string) => void;
}

const ParaphraseAssistant: React.FC<ParaphraseAssistantProps> = ({
  initialText = "",
  onClose,
  onSelect
}) => {
  const [text, setText] = useState(initialText);
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const { 
    paraphraseText, 
    isParaphrasing, 
    paraphraseResult, 
    paraphraseError, 
    clearResult 
  } = useParaphrasing();

  const handleParaphrase = async () => {
    await paraphraseText(text, "", severity);
  };

  const handleCopyToClipboard = () => {
    if (paraphraseResult?.paraphrased) {
      navigator.clipboard.writeText(paraphraseResult.paraphrased);
      toast.success("Copied to clipboard");
    }
  };

  const handleUseParaphrased = () => {
    if (paraphraseResult?.paraphrased && onSelect) {
      onSelect(paraphraseResult.paraphrased);
      toast.success("Paraphrased text applied");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Paraphrasing Assistant
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to rewrite potentially problematic text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!paraphraseResult ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Text to Paraphrase</label>
                  <Select 
                    value={severity}
                    onValueChange={(value) => setSeverity(value as "low" | "medium" | "high")}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Paraphrase Strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Light Revision</SelectItem>
                      <SelectItem value="medium">Moderate Rewrite</SelectItem>
                      <SelectItem value="high">Complete Rewrite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to paraphrase..."
                  className="min-h-[150px]"
                />
              </div>

              <Button 
                onClick={handleParaphrase} 
                disabled={isParaphrasing || !text.trim()} 
                className="w-full"
              >
                {isParaphrasing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating paraphrase...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Paraphrased Version
                  </>
                )}
              </Button>

              {paraphraseError && (
                <Alert variant={paraphraseError.message?.includes('quota') ? "warning" : "destructive"}>
                  {paraphraseError.message?.includes('quota') ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {paraphraseError.message?.includes('quota') ? (
                      <>
                        OpenAI API quota exceeded. The application owner needs to check their OpenAI account billing details.
                      </>
                    ) : (
                      <>Error: {paraphraseError.message}</>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={
                  severity === "high" ? "destructive" : 
                  severity === "medium" ? "default" : 
                  "outline"
                }>
                  {severity === "high" ? "Complete Rewrite" : 
                   severity === "medium" ? "Moderate Rewrite" : 
                   "Light Revision"}
                </Badge>
                <Button variant="outline" size="sm" onClick={clearResult}>
                  Try Another
                </Button>
              </div>

              <Tabs defaultValue="comparison">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="result">Result Only</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comparison" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Original</div>
                      <div className="p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">
                        {paraphraseResult.original}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Paraphrased
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-md text-sm whitespace-pre-wrap">
                        {paraphraseResult.paraphrased}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="result">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Paraphrased Version</div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-md text-sm whitespace-pre-wrap">
                      {paraphraseResult.paraphrased}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <div className="font-medium text-sm mb-2">AI Explanation</div>
                <div className="text-sm text-muted-foreground italic border-l-2 pl-3 py-1">
                  {paraphraseResult.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {paraphraseResult && (
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          {onSelect && (
            <Button onClick={handleUseParaphrased}>
              Use This Version
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ParaphraseAssistant;
