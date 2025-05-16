
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSmartRewriting, RewriteSuggestion } from "@/hooks/use-smart-rewriting";
import { Loader2, Sparkles, AcademicCap, FileEdit, Lightbulb } from "lucide-react";

interface SmartContentRewriterProps {
  flaggedPassage: string;
  originalContext?: string;
  onRewriteSelected: (original: string, rewritten: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const rewritingStyles = [
  { id: "academic", label: "Academic", icon: <AcademicCap className="h-4 w-4" /> },
  { id: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" /> },
  { id: "casual", label: "Casual", icon: <FileEdit className="h-4 w-4" /> },
  { id: "technical", label: "Technical", icon: <Lightbulb className="h-4 w-4" /> },
];

const SmartContentRewriter: React.FC<SmartContentRewriterProps> = ({
  flaggedPassage,
  originalContext = "",
  onRewriteSelected,
  onClose,
  onError,
  onLoadingChange
}) => {
  const [text, setText] = useState(flaggedPassage);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RewriteSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState("academic");

  const {
    generateSmartRewritingSuggestions,
    suggestions,
    isGenerating,
    error
  } = useSmartRewriting();

  // Pass loading state to parent
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isGenerating);
    }
  }, [isGenerating, onLoadingChange]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error.message);
    }
  }, [error, onError]);

  useEffect(() => {
    if (flaggedPassage) {
      setText(flaggedPassage);
      generateRewritings();
    }
  }, [flaggedPassage]);

  const generateRewritings = async () => {
    if (!text.trim()) return;

    try {
      // Generate suggestions for different styles
      await generateSmartRewritingSuggestions(
        text,
        [{ text, similarity: 70 }],
        {
          style: "academic" as any,
          purpose: "plagiarism-fix",
          preserveKeyTerms: true
        }
      );
    } catch (err) {
      console.error("Error generating suggestions:", err);
      if (onError) onError("Failed to generate rewriting suggestions");
    }
  };

  const handleApplyRewrite = () => {
    if (selectedSuggestion) {
      onRewriteSelected(flaggedPassage, selectedSuggestion.rewritten);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) => suggestion.rewritten && suggestion.rewritten.trim() !== ""
  );

  return (
    <div className="space-y-6">
      {!isGenerating && filteredSuggestions.length === 0 && (
        <div className="mb-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to rewrite..."
            rows={4}
            className="mb-4"
          />
          <Button onClick={generateRewritings} disabled={!text.trim() || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Rewriting Suggestions
              </>
            )}
          </Button>
        </div>
      )}

      {(isGenerating || filteredSuggestions.length > 0) && (
        <>
          <div className="bg-muted/50 p-4 rounded-md border">
            <h3 className="font-medium mb-2">Original Text:</h3>
            <p className="text-muted-foreground">{flaggedPassage}</p>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating rewriting suggestions...</p>
            </div>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4">
                  {rewritingStyles.map((style) => (
                    <TabsTrigger key={style.id} value={style.id} className="flex items-center gap-1">
                      {style.icon}
                      <span className="hidden sm:inline">{style.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {rewritingStyles.map((style) => {
                  const styleSuggestion = filteredSuggestions.find(
                    (s) => s.rewritten.includes(style.label) || s.explanation.includes(style.label)
                  ) || filteredSuggestions[0];

                  return (
                    <TabsContent key={style.id} value={style.id}>
                      {styleSuggestion ? (
                        <Card className="border-t-0 rounded-t-none">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center">
                              {style.icon}
                              <span className="ml-2">{style.label} Rewrite</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap border">
                              {styleSuggestion.rewritten}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <strong>Explanation:</strong> {styleSuggestion.explanation}
                            </div>
                            {styleSuggestion.similarityReduction && (
                              <div className="text-sm text-green-600 dark:text-green-400">
                                Similarity reduction: ~{styleSuggestion.similarityReduction}%
                              </div>
                            )}
                            <Button 
                              onClick={() => {
                                setSelectedSuggestion(styleSuggestion);
                                handleApplyRewrite();
                              }}
                              className="w-full"
                            >
                              Use This Version
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="p-8 text-center">
                          <p>No suggestions available for this style.</p>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SmartContentRewriter;
