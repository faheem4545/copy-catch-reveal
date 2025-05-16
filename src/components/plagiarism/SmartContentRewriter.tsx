
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Save, PenLine, BookOpen, Sparkles } from "lucide-react";
import { 
  useSmartRewriting, 
  RewriteStyle, 
  RewritePurpose, 
  RewriteSuggestion 
} from "@/hooks/use-smart-rewriting";
import { Badge } from "@/components/ui/badge";

interface SmartContentRewriterProps {
  initialText?: string;
  flaggedPassage?: string;
  originalContext?: string;
  onRewriteSelected?: (original: string, rewritten: string) => void;
  onClose?: () => void;
}

const SmartContentRewriter: React.FC<SmartContentRewriterProps> = ({
  initialText = "",
  flaggedPassage = "",
  originalContext = "",
  onRewriteSelected,
  onClose
}) => {
  const [text, setText] = useState(flaggedPassage || initialText);
  const [context, setContext] = useState(originalContext);
  const [activeTab, setActiveTab] = useState<string>("quick");
  const [style, setStyle] = useState<RewriteStyle>("academic");
  const [purpose, setPurpose] = useState<RewritePurpose>("plagiarism-fix");
  const [discipline, setDiscipline] = useState("general");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  
  const { 
    generateSmartRewritingSuggestions, 
    generateAcademicRewrite,
    suggestions, 
    isGenerating, 
    error 
  } = useSmartRewriting();

  const handleQuickRewrite = async () => {
    if (!text.trim()) return;
    
    try {
      await generateAcademicRewrite(text, context, discipline);
    } catch (error) {
      console.error("Error in quick rewrite:", error);
    }
  };

  const handleAdvancedRewrite = async () => {
    if (!text.trim()) return;
    
    try {
      await generateSmartRewritingSuggestions(
        text,
        [],
        {
          style,
          purpose,
          academicDiscipline: discipline
        }
      );
    } catch (error) {
      console.error("Error in advanced rewrite:", error);
    }
  };
  
  const handleSelectSuggestion = (index: number) => {
    if (index >= 0 && index < suggestions.length) {
      setSelectedSuggestionIndex(index);
    }
  };
  
  const handleApplySelected = () => {
    if (selectedSuggestionIndex >= 0 && onRewriteSelected) {
      const suggestion = suggestions[selectedSuggestionIndex];
      onRewriteSelected(suggestion.original, suggestion.rewritten);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenLine className="mr-2 h-5 w-5" />
          AI-Powered Content Rewriter
        </CardTitle>
        <CardDescription>
          Get smart suggestions to rewrite content and avoid plagiarism
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "An error occurred while generating suggestions"}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="quick" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">
              <Sparkles className="mr-2 h-4 w-4" />
              Quick Rewrite
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <BookOpen className="mr-2 h-4 w-4" />
              Advanced Options
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text to rewrite</label>
              <Textarea
                placeholder="Enter text that needs rewriting..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Original context (optional)</label>
              <Textarea
                placeholder="Enter surrounding context to improve rewriting quality..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Academic discipline</label>
              <Select 
                value={discipline} 
                onValueChange={setDiscipline}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Academic</SelectItem>
                  <SelectItem value="humanities">Humanities</SelectItem>
                  <SelectItem value="science">Science & STEM</SelectItem>
                  <SelectItem value="social sciences">Social Sciences</SelectItem>
                  <SelectItem value="business">Business & Management</SelectItem>
                  <SelectItem value="law">Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleQuickRewrite} 
              disabled={!text.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Academic Rewrite
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text to rewrite</label>
              <Textarea
                placeholder="Enter text that needs rewriting..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Writing style</label>
                <Select 
                  value={style} 
                  onValueChange={(value) => setStyle(value as RewriteStyle)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="casual">Casual/Simple</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rewrite purpose</label>
                <Select 
                  value={purpose} 
                  onValueChange={(value) => setPurpose(value as RewritePurpose)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plagiarism-fix">Fix Plagiarism</SelectItem>
                    <SelectItem value="clarity">Improve Clarity</SelectItem>
                    <SelectItem value="simplification">Simplify</SelectItem>
                    <SelectItem value="elaboration">Elaborate/Expand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Academic discipline</label>
              <Select 
                value={discipline} 
                onValueChange={setDiscipline}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Academic</SelectItem>
                  <SelectItem value="humanities">Humanities</SelectItem>
                  <SelectItem value="science">Science & STEM</SelectItem>
                  <SelectItem value="social sciences">Social Sciences</SelectItem>
                  <SelectItem value="business">Business & Management</SelectItem>
                  <SelectItem value="law">Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAdvancedRewrite} 
              disabled={!text.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" /> Generate Advanced Rewrite
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Rewriting Suggestions</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <Card 
                  key={index}
                  className={`border ${selectedSuggestionIndex === index ? 'border-primary border-2' : ''}`}
                  onClick={() => handleSelectSuggestion(index)}
                >
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">Suggestion {index + 1}</CardTitle>
                      {suggestion.similarityReduction && (
                        <Badge variant="secondary" className="ml-2">
                          {suggestion.similarityReduction}% reduced similarity
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm whitespace-pre-wrap">{suggestion.rewritten}</div>
                    {suggestion.explanation && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p className="font-medium">Changes made:</p>
                        <p>{suggestion.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <div className="flex gap-2">
          {selectedSuggestionIndex >= 0 && onRewriteSelected && (
            <Button onClick={handleApplySelected}>
              <Save className="mr-2 h-4 w-4" />
              Apply Selected
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SmartContentRewriter;
