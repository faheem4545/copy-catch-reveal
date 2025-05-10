
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, 
  BarChart3, 
  Save, 
  ArrowLeft, 
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  SearchIcon,
  Wand2
} from "lucide-react";
import SimilarityMeter from "./SimilarityMeter";
import SourceQualityIndicator from "./SourceQualityIndicator";
import ComparisonView from "./ComparisonView";
import FeedbackForm from "./FeedbackForm";
import AdvancedAnalysis from "./AdvancedAnalysis";
import ParaphraseAssistant from "./ParaphraseAssistant";
import PlagiarismClassifier from "./PlagiarismClassifier";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SemanticSearchResult } from "@/hooks/use-semantic-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Source {
  url: string;
  title: string;
  matchPercentage: number;
  matchedText: string;
  type?: "academic" | "trusted" | "blog" | "unknown";
  publicationDate?: string;
  context?: string;
}

interface ResultsDisplayExtendedProps {
  originalText: string;
  similarityScore: number;
  sources: Source[];
  highlightedText: React.ReactNode;
  isSearchingSources: boolean;
  semanticResults: SemanticSearchResult[];
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  contentStats: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    complexityScore: number;
  };
}

const ResultsDisplayExtended: React.FC<ResultsDisplayExtendedProps> = ({
  originalText,
  similarityScore,
  sources,
  highlightedText,
  isSearchingSources,
  semanticResults,
  onReset,
  onSave,
  isSaving,
  contentStats
}) => {
  const [comparisonSource, setComparisonSource] = useState<Source | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isParaphraseOpen, setIsParaphraseOpen] = useState(false);
  const [currentTextToParaphrase, setCurrentTextToParaphrase] = useState("");
  const [feedbackSource, setFeedbackSource] = useState<{
    id: string;
    matchPercentage: number;
    sourceUrl: string;
  }>({ id: "", matchPercentage: 0, sourceUrl: "" });

  const handleOpenComparison = (source: Source) => {
    setComparisonSource(source);
    setIsComparisonOpen(true);
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
  };

  const handleOpenFeedback = (sourceId: string, matchPercentage: number, sourceUrl: string) => {
    setFeedbackSource({ id: sourceId, matchPercentage, sourceUrl });
    setIsFeedbackOpen(true);
  };

  const handleOpenParaphraser = (text?: string) => {
    setCurrentTextToParaphrase(text || "");
    setIsParaphraseOpen(true);
  };

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-md">
        <div>
          <h2 className="text-2xl font-bold">Plagiarism Results</h2>
          <p className="text-gray-600">
            {isSearchingSources 
              ? "Searching for potential similar sources..." 
              : sources.length === 0 
              ? "No similar sources detected" 
              : `Found ${sources.length} potential similar sources`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onReset} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> New Check
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> 
            {isSaving ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="results" className="flex gap-2 items-center">
            <AlignLeft className="h-4 w-4" /> Results
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex gap-2 items-center">
            <BarChart3 className="h-4 w-4" /> Advanced Analysis
          </TabsTrigger>
          <TabsTrigger value="paraphrase" className="flex gap-2 items-center">
            <Wand2 className="h-4 w-4" /> Paraphrase
          </TabsTrigger>
          <TabsTrigger value="original" className="flex gap-2 items-center">
            <SearchIcon className="h-4 w-4" /> Original Text
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="results" className="space-y-6">
          <div className="flex flex-col md:flex-row w-full gap-6">
            <div className="md:w-1/2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    Similarity Score
                    <SimilarityMeter score={similarityScore} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-2">
                    <span className="text-4xl font-bold">
                      {similarityScore}%
                    </span>
                    <p className="text-gray-500 mt-1">
                      {similarityScore < 15
                        ? "Low similarity detected"
                        : similarityScore < 30
                        ? "Moderate similarity detected"
                        : "High similarity detected"}
                    </p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-sm">
                    {similarityScore < 15 ? (
                      <p>This content appears to be mostly original, with minimal similarities to existing sources.</p>
                    ) : similarityScore < 30 ? (
                      <p>Some similarities detected. Consider checking highlighted sections and adding citations if needed.</p>
                    ) : (
                      <p className="text-red-600 font-medium">Significant similarity detected. This content contains substantial portions that match existing sources.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content Stats Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Content Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Word Count</p>
                      <p className="font-semibold">{contentStats.wordCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sentences</p>
                      <p className="font-semibold">{contentStats.sentenceCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Complexity Score</p>
                      <p className="font-semibold">{contentStats.complexityScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paragraphs with Matches</p>
                      <p className="font-semibold">
                        {semanticResults.filter(result => result.matches.length > 0).length}/{semanticResults.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plagiarism Classification */}
              <PlagiarismClassifier 
                similarityScore={similarityScore}
                contentLength={contentStats.wordCount}
              />
            </div>
            
            <div className="md:w-1/2">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle>Detected Sources</CardTitle>
                  <CardDescription>
                    {sources.length > 0
                      ? "The following sources have similar content"
                      : "No similar sources detected"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto max-h-[400px]">
                  {isSearchingSources ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">Searching for sources...</span>
                    </div>
                  ) : sources.length > 0 ? (
                    <div className="space-y-4">
                      {sources.map((source, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-medium line-clamp-1">{source.title}</h3>
                            <Badge variant={source.matchPercentage > 60 ? "destructive" : "outline"}>
                              {source.matchPercentage}% match
                            </Badge>
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <SourceQualityIndicator type={source.type || "unknown"} />
                            {source.publicationDate && (
                              <span className="ml-3">Published: {source.publicationDate}</span>
                            )}
                          </div>
                          
                          <div className="mt-2 text-sm line-clamp-2 text-gray-600">
                            {source.context || (
                              <span className="italic">No preview available</span>
                            )}
                          </div>
                          
                          <div className="flex justify-between mt-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleOpenComparison(source)}
                              >
                                Compare
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleParaphraser(source.matchedText)}
                              >
                                <Wand2 className="h-3 w-3 mr-1" />
                                Paraphrase
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleOpenFeedback(`source-${index}`, source.matchPercentage, source.url)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" /> Feedback
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-xs"
                                      onClick={() => window.open(source.url, "_blank")}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" /> Visit
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visit source</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No similar sources detected in our database
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Highlighted Text</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleOpenParaphraser(originalText)}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Paraphrase All
                </Button>
              </CardTitle>
              <CardDescription>
                Yellow highlighted sections indicate potential similarity with other sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {highlightedText}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <AdvancedAnalysis
            originalText={originalText}
            similarityScore={similarityScore}
            sources={sources}
            semanticResults={semanticResults}
            contentStats={contentStats}
          />
        </TabsContent>

        <TabsContent value="paraphrase">
          <ParaphraseAssistant initialText={currentTextToParaphrase} />
        </TabsContent>

        <TabsContent value="original">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
              <CardDescription>Your submitted content</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="whitespace-pre-wrap">
                {originalText}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison Modal */}
      <ComparisonView 
        isOpen={isComparisonOpen}
        onClose={handleCloseComparison}
        originalText={originalText}
        source={comparisonSource}
      />

      {/* Feedback Modal */}
      <FeedbackForm
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        sourceId={feedbackSource.id}
        matchPercentage={feedbackSource.matchPercentage}
        sourceUrl={feedbackSource.sourceUrl}
      />

      {/* Paraphraser Dialog */}
      <Dialog open={isParaphraseOpen} onOpenChange={setIsParaphraseOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Paraphrasing Assistant</DialogTitle>
          </DialogHeader>
          <ParaphraseAssistant 
            initialText={currentTextToParaphrase}
            onClose={() => setIsParaphraseOpen(false)}
            onSelect={(text) => setIsParaphraseOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResultsDisplayExtended;
