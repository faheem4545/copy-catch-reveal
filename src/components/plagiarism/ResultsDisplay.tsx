
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Source {
  url: string;
  title: string;
  matchPercentage: number;
  matchedText: string;
}

interface ResultsDisplayProps {
  originalText: string;
  similarityScore: number;
  sources: Source[];
  highlightedText: React.ReactNode;
}

const ResultsDisplay = ({
  originalText,
  similarityScore,
  sources,
  highlightedText,
}: ResultsDisplayProps) => {
  // Calculate color based on similarity score
  const getScoreColor = () => {
    if (similarityScore < 20) return "text-green-600";
    if (similarityScore < 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
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
        <Tabs defaultValue="highlighted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="highlighted">Highlighted Text</TabsTrigger>
            <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="highlighted" className="mt-4">
            <div className="bg-white p-4 rounded-md border min-h-[300px] max-h-[500px] overflow-auto">
              {highlightedText}
            </div>
          </TabsContent>
          <TabsContent value="sources" className="mt-4">
            <div className="bg-white rounded-md border divide-y">
              {sources.length > 0 ? (
                sources.map((source, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{source.title}</h3>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
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
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No matching sources found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline">Download Report</Button>
          <Button variant="outline">Save to Dashboard</Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Try Another Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
