
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Fingerprint, Loader2 } from "lucide-react";
import { useWritingAnalysis } from "@/hooks/use-writing-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WritingStyleAnalyzerProps {
  content?: string;
  userId?: string;
}

const WritingStyleAnalyzer: React.FC<WritingStyleAnalyzerProps> = ({ 
  content = "", 
  userId 
}) => {
  const { 
    analyzeWritingStyle, 
    detectAIContent,
    isAnalyzing,
    analysisResult,
    aiDetectionResult
  } = useWritingAnalysis();
  
  const [activeTab, setActiveTab] = useState("style");

  const handleStyleAnalysis = async () => {
    if (content) {
      await analyzeWritingStyle(content, userId);
    }
  };

  const handleAIDetection = async () => {
    if (content) {
      await detectAIContent(content);
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 75) return "text-red-500";
    if (score >= 40) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="mr-2 h-5 w-5" />
          Writing Analysis
        </CardTitle>
        <CardDescription>
          Analyze writing style consistency and detect AI-generated content
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="style">Style Fingerprint</TabsTrigger>
            <TabsTrigger value="ai">AI Detection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style">
            {analysisResult ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Style Consistency</span>
                    <span className={`font-bold ${getConsistencyColor(analysisResult.consistencyScore)}`}>
                      {analysisResult.consistencyScore}%
                    </span>
                  </div>
                  <Progress value={analysisResult.consistencyScore} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-md p-3">
                    <p className="text-sm font-medium mb-1">Sentence Structure</p>
                    <div className="flex items-center">
                      <Progress value={analysisResult.sentenceVariety} className="h-1.5 mr-2 flex-1" />
                      <span className="text-xs font-medium">{analysisResult.sentenceVariety}%</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-3">
                    <p className="text-sm font-medium mb-1">Vocabulary Richness</p>
                    <div className="flex items-center">
                      <Progress value={analysisResult.vocabularyRichness} className="h-1.5 mr-2 flex-1" />
                      <span className="text-xs font-medium">{analysisResult.vocabularyRichness}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Common Patterns</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.patterns.map((pattern, idx) => (
                      <Badge key={idx} variant="outline">{pattern}</Badge>
                    ))}
                  </div>
                </div>
                
                {analysisResult.matchesUserStyle !== undefined && (
                  <Alert variant={analysisResult.matchesUserStyle ? "default" : "destructive"} className="mt-4">
                    <AlertDescription>
                      {analysisResult.matchesUserStyle
                        ? "This writing matches your typical style."
                        : "This writing differs significantly from your usual style."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Analyze Style" to evaluate writing style consistency
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai">
            {aiDetectionResult ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">AI-Generated Probability</span>
                    <span className={`font-bold ${getAIScoreColor(aiDetectionResult.aiProbability)}`}>
                      {aiDetectionResult.aiProbability}%
                    </span>
                  </div>
                  <Progress value={aiDetectionResult.aiProbability} className="h-2" />
                </div>
                
                <Alert variant={aiDetectionResult.aiProbability > 70 ? "destructive" : "default"}>
                  <AlertDescription>
                    {aiDetectionResult.aiProbability > 70
                      ? "This content likely contains AI-generated text."
                      : aiDetectionResult.aiProbability > 40
                      ? "This content may contain some AI-generated elements."
                      : "This content appears to be human-written."}
                  </AlertDescription>
                </Alert>
                
                <div>
                  <p className="text-sm font-medium mb-2">AI Patterns Detected</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {aiDetectionResult.patterns.map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Check AI Content" to analyze for AI-generated text
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {activeTab === "style" ? (
          <Button onClick={handleStyleAnalysis} disabled={!content || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" /> Analyze Style
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleAIDetection} disabled={!content || isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" /> Check AI Content
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WritingStyleAnalyzer;
