
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, AlertTriangle, Check, BookMarked } from "lucide-react";

interface AdvancedAnalysisProps {
  originalText: string;
  similarityScore: number;
  sources: Array<{
    url: string;
    title: string;
    matchPercentage: number;
    matchedText: string;
    type?: "academic" | "trusted" | "blog" | "unknown";
    publicationDate?: string;
  }>;
  semanticResults: Array<{
    paragraph: string;
    matches: Array<{
      similarity: number;
      content: string;
      source_url?: string;
      source_title?: string;
    }>;
  }>;
  contentStats: {
    wordCount: number;
    sentenceCount: number;
    avgSentenceLength: number;
    complexityScore: number;
  };
}

const AdvancedAnalysis: React.FC<AdvancedAnalysisProps> = ({
  originalText,
  similarityScore,
  sources,
  semanticResults,
  contentStats,
}) => {
  // Calculate percentages of different source types
  const sourceTypes = sources.reduce(
    (acc, source) => {
      const type = source.type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sourcePieData = [
    { name: 'Academic', value: sourceTypes.academic || 0, color: '#4CAF50' },
    { name: 'Trusted', value: sourceTypes.trusted || 0, color: '#2196F3' },
    { name: 'Blog', value: sourceTypes.blog || 0, color: '#FF9800' },
    { name: 'Unknown', value: sourceTypes.unknown || 0, color: '#9E9E9E' },
  ].filter(item => item.value > 0);

  // Generate match distribution data
  const matchDistribution = sources.map(source => ({
    name: source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title,
    value: source.matchPercentage,
    color: source.matchPercentage > 70 ? '#f44336' : source.matchPercentage > 40 ? '#FF9800' : '#4CAF50',
  }));

  // Calculate paragraphs with matches
  const paragraphsWithMatches = semanticResults.filter(result => result.matches.length > 0).length;
  const paragraphPercentage = semanticResults.length > 0 
    ? Math.round((paragraphsWithMatches / semanticResults.length) * 100) 
    : 0;

  // Generate risk assessment
  const getRiskLevel = () => {
    if (similarityScore >= 40) return { level: 'High', color: '#f44336', icon: AlertTriangle };
    if (similarityScore >= 20) return { level: 'Medium', color: '#FF9800', icon: BookOpen };
    return { level: 'Low', color: '#4CAF50', icon: Check };
  };
  
  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="sources">Source Analysis</TabsTrigger>
          <TabsTrigger value="text">Text Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Plagiarism Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <RiskIcon className="h-8 w-8" style={{ color: risk.color }} />
                  <div>
                    <div className="text-2xl font-bold" style={{ color: risk.color }}>{risk.level}</div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                </div>
                <Progress 
                  className="mt-4" 
                  value={similarityScore} 
                  indicatorColor={risk.level === 'High' ? 'bg-red-500' : risk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}
                />
                <div className="mt-1 text-sm text-muted-foreground">
                  {similarityScore}% similarity detected
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Content Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Word Count:</span>
                    <span className="font-medium">{contentStats.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sentences:</span>
                    <span className="font-medium">{contentStats.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. Sentence Length:</span>
                    <span className="font-medium">{contentStats.avgSentenceLength.toFixed(1)} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Complexity Score:</span>
                    <span className="font-medium">{contentStats.complexityScore}/100</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-sm">Paragraphs with Matches:</span>
                    <span className="font-medium">{paragraphsWithMatches} of {semanticResults.length} ({paragraphPercentage}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
              <CardDescription>Summary of plagiarism detection results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={sources.length > 0 ? "destructive" : "outline"}>{sources.length}</Badge>
                  <span>Potential source{sources.length !== 1 ? 's' : ''} identified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={paragraphsWithMatches > 0 ? "destructive" : "outline"}>{paragraphsWithMatches}</Badge>
                  <span>Paragraph{paragraphsWithMatches !== 1 ? 's' : ''} with matching content</span>
                </div>
                {sources.length > 0 && (
                  <div className="pt-2">
                    <div className="font-medium mb-2">Top sources:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {sources.slice(0, 3).map((source, i) => (
                        <li key={i} className="text-sm">
                          {source.title} 
                          <span className="text-muted-foreground ml-2">
                            ({source.matchPercentage}% match)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source Types Distribution</CardTitle>
              <CardDescription>Analysis of detected source types</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              {sourcePieData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourcePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourcePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No source type data available
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Source Match Percentages</CardTitle>
              <CardDescription>Similarity scores by source</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              {matchDistribution.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={matchDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis label={{ value: 'Match %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Match Percentage">
                        {matchDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No match data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Complexity Analysis</CardTitle>
              <CardDescription>Readability and structure metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-medium">Sentence Length</div>
                  <Progress value={Math.min(100, contentStats.avgSentenceLength * 5)} className="mb-1" />
                  <div className="text-xs text-muted-foreground">
                    Average: {contentStats.avgSentenceLength.toFixed(1)} words per sentence
                  </div>
                  <div className="mt-4 text-sm">
                    {contentStats.avgSentenceLength > 25 ? (
                      <span className="text-yellow-600">Sentences are quite long, which can be an indicator of complex academic writing.</span>
                    ) : contentStats.avgSentenceLength > 15 ? (
                      <span>Sentence length is balanced, typical of well-structured writing.</span>
                    ) : (
                      <span>Sentences are relatively short, indicating simple or concise writing.</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="mb-2 text-sm font-medium">Text Complexity</div>
                  <Progress value={contentStats.complexityScore} className="mb-1" />
                  <div className="text-xs text-muted-foreground">
                    Score: {contentStats.complexityScore}/100
                  </div>
                  <div className="mt-4 text-sm">
                    {contentStats.complexityScore > 70 ? (
                      <span className="text-yellow-600">High complexity might indicate specialized or academic content. Check for proper citations.</span>
                    ) : contentStats.complexityScore > 40 ? (
                      <span>Moderate complexity, appropriate for most academic contexts.</span>
                    ) : (
                      <span>Lower complexity text, likely more accessible to general audiences.</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium">Paragraph Analysis</div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <div className="text-2xl font-bold">{semanticResults.length}</div>
                    <div className="text-xs">Total Paragraphs</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <div className="text-2xl font-bold">{paragraphsWithMatches}</div>
                    <div className="text-xs">With Matches</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <div className="text-2xl font-bold">{paragraphPercentage}%</div>
                    <div className="text-xs">Affected</div>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(contentStats.wordCount / Math.max(1, semanticResults.length))}
                    </div>
                    <div className="text-xs">Avg. Words per ¶</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Recommendations</CardTitle>
              <CardDescription>Based on plagiarism analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {similarityScore > 30 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">High similarity detected.</span> Consider rewriting sections with high match percentages to avoid plagiarism concerns.
                    </div>
                  </li>
                )}
                
                {sources.length > 0 && (
                  <li className="flex items-start gap-2">
                    <BookMarked className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Add proper citations.</span> Include references to the identified sources using appropriate citation style.
                    </div>
                  </li>
                )}
                
                {contentStats.avgSentenceLength > 25 && (
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Consider sentence structure.</span> Your sentences are quite long. Breaking some into shorter sentences may improve readability.
                    </div>
                  </li>
                )}
                
                {paragraphPercentage > 50 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Significant matched content.</span> Over half of your paragraphs contain potentially matched content. Consider adding more original analysis and insights.
                    </div>
                  </li>
                )}
                
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Use quotations.</span> When directly using text from other sources, place it in quotation marks and provide proper attribution.
                  </div>
                </li>
                
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Paraphrase effectively.</span> When incorporating ideas from other sources, express them in your own words while still citing the original source.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalysis;
