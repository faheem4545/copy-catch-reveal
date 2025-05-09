
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  Info, 
  ArrowLeft,
  Filter, 
  Download,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  Copy,
  Save,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { SimilarityMeter } from "@/components/plagiarism";
import { SourceQualityIndicator } from "@/components/plagiarism/SourceQualityIndicator";
import { useCitationGenerator, CitationStyle } from "@/hooks/use-citation-generator";
import { cn } from "@/lib/utils";
import ComparisonView from "./ComparisonView";
import FeedbackForm from "./FeedbackForm";
import { SemanticSearchResult } from "@/hooks/use-semantic-search";

interface Source {
  url: string;
  title: string;
  matchPercentage: number;
  matchedText: string;
  type?: "academic" | "trusted" | "blog" | "unknown";
  publicationDate?: string;
  context?: string;
}

interface ResultsDisplayProps {
  originalText: string;
  similarityScore: number;
  sources: Source[];
  highlightedText: React.ReactNode;
  isSearchingSources?: boolean;
  semanticResults?: SemanticSearchResult[];
  onReset?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const ResultsDisplay = ({
  originalText,
  similarityScore,
  sources,
  highlightedText,
  isSearchingSources = false,
  semanticResults = [],
  onReset,
  onSave,
  isSaving = false,
}: ResultsDisplayProps) => {
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<number, "positive" | "negative" | null>>({});
  const [activeSourceTypes, setActiveSourceTypes] = useState<Record<string, boolean>>({
    academic: true,
    trusted: true,
    blog: true,
    unknown: true,
  });
  const [activeCitationStyle, setActiveCitationStyle] = useState<CitationStyle>("apa");
  const { generateCitation } = useCitationGenerator();
  
  // New state variables for comparison and feedback
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [selectedSourceForComparison, setSelectedSourceForComparison] = useState<Source | null>(null);
  const [feedbackSourceId, setFeedbackSourceId] = useState<string>("");
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  // Summary tab states
  const [showSemanticResults, setShowSemanticResults] = useState(true);
  const [activeTab, setActiveTab] = useState("highlighted");

  const getScoreColor = () => {
    if (similarityScore < 20) return "text-green-600";
    if (similarityScore < 50) return "text-yellow-600";
    return "text-red-600";
  };

  const handleFeedback = (sourceId: number, feedback: "positive" | "negative") => {
    setFeedbackSubmitted(prev => ({ ...prev, [sourceId]: feedback }));
    toast.success("Thank you for your feedback! This helps improve our detection algorithm.");
  };

  const handleOpenFeedbackForm = (sourceId: string, sourceUrl: string, matchPercentage: number) => {
    setFeedbackSourceId(sourceId);
    setIsFeedbackFormOpen(true);
  };

  const handleDownloadReport = () => {
    const reportText = `
      Plagiarism Analysis Report
      =========================
      
      Similarity Score: ${similarityScore}%
      
      Original Text:
      ${originalText}
      
      Detected Sources (${sources.length}):
      ${sources.map((source, index) => `
        ${index + 1}. ${source.title}
        URL: ${source.url}
        Match Percentage: ${source.matchPercentage}%
        Source Type: ${source.type || "Unknown"}
        ${source.publicationDate ? `Publication Date: ${source.publicationDate}` : ""}
      `).join('\n')}

      ${semanticResults && semanticResults.length > 0 ? `
      Semantic Analysis Results:
      ${semanticResults.map((result, index) => `
        Paragraph ${index + 1}: "${result.paragraph.substring(0, 100)}..."
        Matches: ${result.matches.length}
        ${result.matches.map((match, i) => `
          Match ${i + 1}: Similarity ${Math.round(match.similarity * 100)}%
          Source: ${match.source_title || 'Unknown'}
          URL: ${match.source_url || 'N/A'}
        `).join('\n')}
      `).join('\n')}
      ` : ''}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plagiarism-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };

  const handleCopyCitation = (source: Source) => {
    const citation = generateCitation({
      title: source.title,
      url: source.url,
      date: source.publicationDate,
      // Add more metadata as needed
    }, activeCitationStyle);

    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard");
  };

  const handleOpenComparison = (source: Source) => {
    setSelectedSourceForComparison(source);
    setIsComparisonOpen(true);
  };

  const filteredSources = sources.filter(source => {
    const sourceType = source.type || "unknown";
    return activeSourceTypes[sourceType];
  });

  const sortedSources = [...filteredSources].sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Generate summary metrics
  const generateSummaryStats = () => {
    const totalWords = originalText.split(/\s+/).filter(Boolean).length;
    const matchedWords = Math.round((totalWords * similarityScore) / 100);
    const originalityScore = 100 - similarityScore;
    const academicCount = sources.filter(s => s.type === "academic").length;
    const trustedCount = sources.filter(s => s.type === "trusted").length;
    const blogCount = sources.filter(s => s.type === "blog").length;
    const recommendedCitations = sources.filter(s => s.matchPercentage > 30).length;
    
    return {
      totalWords,
      matchedWords,
      originalityScore,
      academicCount,
      trustedCount,
      blogCount,
      recommendedCitations,
    };
  };

  const stats = generateSummaryStats();

  return (
    <>
      <Card className="shadow-lg mt-6 fade-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Plagiarism Analysis Results</CardTitle>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Similarity Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor()}`}>
                  {similarityScore}%
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={18} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        This score indicates the percentage of your text that matches existing content.
                        Lower scores indicate more original content.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress
                value={similarityScore}
                className="h-2 w-40 mt-1"
                indicatorClassName={
                  similarityScore < 20
                    ? "bg-green-600"
                    : similarityScore < 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="highlighted">Highlighted Text</TabsTrigger>
              <TabsTrigger value="sources">
                Sources ({sources.length})
                {isSearchingSources && (
                  <Loader2 size={14} className="ml-2 animate-spin" />
                )}
              </TabsTrigger>
              <TabsTrigger value="summary">Summary Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="highlighted" className="mt-4">
              <div className="bg-white p-4 rounded-md border min-h-[300px] max-h-[500px] overflow-auto">
                {highlightedText || 
                  <p className="text-gray-500 text-center py-8">No text analysis available</p>
                }
              </div>
            </TabsContent>
            <TabsContent value="sources" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {activeSourceId !== null ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveSourceId(null)}
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft size={16} /> Back to sources
                    </Button>
                  ) : (
                    <h3 className="text-sm font-medium text-gray-500">
                      {isSearchingSources ? (
                        <span className="flex items-center">
                          Searching for matching sources
                          <Loader2 size={14} className="ml-2 animate-spin" />
                        </span>
                      ) : (
                        `${sortedSources.length} sources found`
                      )}
                    </h3>
                  )}
                </div>
                
                {activeSourceId === null && (
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Filter size={14} /> Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem className="text-xs text-gray-500">Source types</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={activeSourceTypes.academic}
                          onCheckedChange={(checked) => setActiveSourceTypes(prev => ({...prev, academic: checked}))}
                        >
                          Academic sources
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={activeSourceTypes.trusted}
                          onCheckedChange={(checked) => setActiveSourceTypes(prev => ({...prev, trusted: checked}))}
                        >
                          Trusted publications
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={activeSourceTypes.blog}
                          onCheckedChange={(checked) => setActiveSourceTypes(prev => ({...prev, blog: checked}))}
                        >
                          Blogs & forums
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={activeSourceTypes.unknown}
                          onCheckedChange={(checked) => setActiveSourceTypes(prev => ({...prev, unknown: checked}))}
                        >
                          Other sources
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button variant="outline" size="sm" onClick={handleDownloadReport} className="flex items-center gap-1">
                      <Download size={14} /> Export
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-md border divide-y">
                {isSearchingSources && sortedSources.length === 0 ? (
                  <div className="p-8 text-center">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-purple-600" />
                    <p className="text-gray-600">Searching for matching sources...</p>
                  </div>
                ) : sortedSources.length > 0 ? (
                  activeSourceId !== null ? (
                    <div className="p-5">
                      <div className="mb-6">
                        <h3 className="font-medium text-lg text-gray-900 mb-1">{sources[activeSourceId].title}</h3>
                        <a
                          href={sources[activeSourceId].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          {sources[activeSourceId].url}
                          <ExternalLink size={14} />
                        </a>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <SourceQualityIndicator type={sources[activeSourceId].type || "unknown"} />
                          
                          {sources[activeSourceId].publicationDate && (
                            <Badge variant="outline" className="text-xs">
                              Published: {sources[activeSourceId].publicationDate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Matched Content:</h4>
                        <div className="bg-gray-50 p-4 rounded mt-2 text-sm text-gray-700 border-l-4 border-purple-400">
                          "{sources[activeSourceId].matchedText}"
                        </div>
                      </div>
                      
                      {sources[activeSourceId].context && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Context:</h4>
                          <div className="bg-gray-50 p-4 rounded mt-2 text-sm text-gray-700 border-l-4 border-gray-300">
                            {sources[activeSourceId].context}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-gray-500">Match percentage: </span>
                          <span className="font-medium">{sources[activeSourceId].matchPercentage}%</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Is this match accurate?</span>
                          <div className="flex gap-1">
                            <Button 
                              variant={feedbackSubmitted[activeSourceId] === "positive" ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => handleFeedback(activeSourceId, "positive")}
                              disabled={feedbackSubmitted[activeSourceId] !== undefined}
                              className={feedbackSubmitted[activeSourceId] === "positive" ? "bg-green-500" : ""}
                            >
                              <ThumbsUp size={14} />
                            </Button>
                            <Button 
                              variant={feedbackSubmitted[activeSourceId] === "negative" ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => handleFeedback(activeSourceId, "negative")}
                              disabled={feedbackSubmitted[activeSourceId] !== undefined}
                              className={feedbackSubmitted[activeSourceId] === "negative" ? "bg-red-500" : ""}
                            >
                              <ThumbsDown size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add citation generator */}
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Citation</h3>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-2">
                              <button 
                                className={cn("px-2 py-1 text-xs rounded", 
                                  activeCitationStyle === "apa" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                                )}
                                onClick={() => setActiveCitationStyle("apa")}
                              >
                                APA
                              </button>
                              <button 
                                className={cn("px-2 py-1 text-xs rounded", 
                                  activeCitationStyle === "mla" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                                )}
                                onClick={() => setActiveCitationStyle("mla")}
                              >
                                MLA
                              </button>
                              <button 
                                className={cn("px-2 py-1 text-xs rounded", 
                                  activeCitationStyle === "chicago" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                                )}
                                onClick={() => setActiveCitationStyle("chicago")}
                              >
                                Chicago
                              </button>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => handleCopyCitation(sources[activeSourceId])}
                            >
                              <Copy size={12} className="mr-1" /> Copy
                            </Button>
                          </div>
                          <p className="text-sm font-medium bg-white p-2 border rounded">
                            {generateCitation({
                              title: sources[activeSourceId].title,
                              url: sources[activeSourceId].url,
                              date: sources[activeSourceId].publicationDate,
                              // Add other metadata as needed
                            }, activeCitationStyle)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleOpenFeedbackForm(`source-${activeSourceId}`, sources[activeSourceId].url, sources[activeSourceId].matchPercentage)}
                        >
                          <MessageSquare size={14} /> Detailed Feedback
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleOpenComparison(sources[activeSourceId])}
                        >
                          Compare Text
                        </Button>
                      </div>
                    </div>
                  ) : (
                    sortedSources.map((source, index) => (
                      <div 
                        key={index} 
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setActiveSourceId(sources.findIndex(s => s.url === source.url))}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">{source.title}</h3>
                              <SourceQualityIndicator type={source.type || "unknown"} />
                            </div>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {source.url.length > 50
                                ? `${source.url.substring(0, 50)}...`
                                : source.url}
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100">
                            {source.matchPercentage}% match
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded mt-2 text-sm text-gray-700 border-l-4 border-purple-400">
                          "{source.matchedText.length > 150
                            ? `${source.matchedText.substring(0, 150)}...`
                            : source.matchedText}"
                        </div>
                        {/* Quick action buttons */}
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCitation(source);
                            }}
                          >
                            <Copy size={12} /> Citation
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenComparison(source);
                            }}
                          >
                            Compare
                          </Button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {isSearchingSources 
                      ? "Searching for matches..."
                      : "No matching sources found based on your filter criteria"}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="summary" className="mt-4">
              <div className="bg-white p-6 rounded-md border space-y-6">
                {/* Summary metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md border text-center">
                    <p className="text-sm text-gray-500">Total Words</p>
                    <p className="text-2xl font-bold">{stats.totalWords}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border text-center">
                    <p className="text-sm text-gray-500">Matched Words</p>
                    <p className="text-2xl font-bold">{stats.matchedWords}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border text-center">
                    <p className="text-sm text-gray-500">Originality Score</p>
                    <p className={`text-2xl font-bold ${stats.originalityScore > 80 ? 'text-green-600' : stats.originalityScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {stats.originalityScore}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border text-center">
                    <p className="text-sm text-gray-500">Sources Found</p>
                    <p className="text-2xl font-bold">{sources.length}</p>
                  </div>
                </div>

                {/* Source breakdown */}
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="font-medium mb-2">Source Types</h3>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Academic: {stats.academicCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Trusted: {stats.trustedCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Blog/Forum: {stats.blogCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>Other: {sources.length - stats.academicCount - stats.trustedCount - stats.blogCount}</span>
                    </div>
                  </div>
                </div>

                {/* AI analysis */}
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h3 className="font-medium mb-4">AI Analysis</h3>
                  <div className="space-y-2">
                    <p>
                      {similarityScore < 20 
                        ? "Your text appears to be highly original with minimal matching content detected."
                        : similarityScore < 40
                        ? "Your text contains some matching content that may require citation."
                        : similarityScore < 60
                        ? "Significant matching content detected. Consider revising and adding proper citations."
                        : "High level of matching content detected. Major revision and proper citation required."}
                    </p>
                    
                    {stats.recommendedCitations > 0 && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Recommendation:</strong> Add {stats.recommendedCitations} citation{stats.recommendedCitations !== 1 ? 's' : ''} to acknowledge the sources with significant matches.
                      </p>
                    )}
                  </div>
                </div>

                {/* Semantic results */}
                {semanticResults && semanticResults.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                      <h3 className="font-medium">Semantic Matching Results</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSemanticResults(!showSemanticResults)}
                      >
                        {showSemanticResults ? "Hide" : "Show"}
                      </Button>
                    </div>
                    
                    {showSemanticResults && (
                      <div className="divide-y">
                        {semanticResults
                          .filter(result => result.matches.length > 0)
                          .map((result, idx) => (
                            <div key={idx} className="p-3">
                              <p className="text-sm mb-2 font-medium">Paragraph {idx + 1}:</p>
                              <div className="bg-gray-50 p-2 rounded text-sm mb-2">
                                "{result.paragraph.length > 150 
                                  ? `${result.paragraph.substring(0, 150)}...` 
                                  : result.paragraph}"
                              </div>
                              <div className="text-xs text-gray-500">
                                {result.matches.length} semantic match{result.matches.length !== 1 ? 'es' : ''} found
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <SimilarityMeter score={similarityScore} />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleDownloadReport} className="flex items-center gap-2">
              <Download size={16} />
              Download Report
            </Button>
            {onSave && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save size={16} />}
                {isSaving ? "Saving..." : "Save Report"}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onReset}
            >
              <RefreshCw size={16} />
              New Check
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={onReset}
            >
              Try Another Check
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Comparison dialog */}
      {selectedSourceForComparison && (
        <ComparisonView
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          originalText={originalText}
          source={selectedSourceForComparison}
        />
      )}
      
      {/* Feedback form dialog */}
      <FeedbackForm
        open={isFeedbackFormOpen}
        onOpenChange={setIsFeedbackFormOpen}
        sourceId={feedbackSourceId}
        matchPercentage={activeSourceId !== null ? sources[activeSourceId].matchPercentage : 0}
        sourceUrl={activeSourceId !== null ? sources[activeSourceId].url : ""}
      />
    </>
  );
};

export default ResultsDisplay;
