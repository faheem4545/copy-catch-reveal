
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen, Sparkles, FileEdit, BarChart2 } from "lucide-react";
import SmartContentRewriter from "./SmartContentRewriter";
import { useSmartRewriting } from "@/hooks/use-smart-rewriting";
import { toast } from "sonner";

interface AdvancedSuggestionPanelProps {
  originalText: string;
  flaggedPassages?: { text: string; similarity: number }[];
  onApplySuggestion?: (originalText: string, newText: string) => void;
}

const AdvancedSuggestionPanel: React.FC<AdvancedSuggestionPanelProps> = ({
  originalText,
  flaggedPassages = [],
  onApplySuggestion
}) => {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [selectedText, setSelectedText] = useState<string>("");
  const { suggestions } = useSmartRewriting();

  const handleRewriteSelected = (original: string, rewritten: string) => {
    if (onApplySuggestion) {
      onApplySuggestion(original, rewritten);
      toast.success("Suggestion applied successfully!");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Writing Assistance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">
              <FileEdit className="mr-2 h-4 w-4" />
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="rewriter">
              <BookOpen className="mr-2 h-4 w-4" />
              Content Rewriter
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="mr-2 h-4 w-4" />
              Writing Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Flagged Content</h3>
              {flaggedPassages.length > 0 ? (
                <div className="space-y-3">
                  {flaggedPassages.map((passage, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Flagged passage {index + 1}</span>
                          <span className="text-sm text-destructive">{passage.similarity}% similarity</span>
                        </div>
                        <p className="text-sm mb-2">{passage.text}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedText(passage.text)}
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Rewrite this
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No flagged content to display</p>
                  <p className="text-sm">Analyze your text to identify potential issues</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rewriter" className="mt-4">
            <SmartContentRewriter
              initialText={selectedText || ""}
              originalContext={originalText}
              onRewriteSelected={handleRewriteSelected}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Writing Analysis</h3>
              <div className="p-4 text-center text-muted-foreground border border-dashed rounded-md">
                <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Writing analytics will appear here</p>
                <p className="text-sm">Submit text to see detailed analysis of your writing</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedSuggestionPanel;
