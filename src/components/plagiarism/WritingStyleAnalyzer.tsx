import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWritingAnalysis } from "@/hooks/use-writing-analysis";
import { Loader2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface WritingStyleAnalyzerProps {
  content: string;
  userId?: string;
}

const WritingStyleAnalyzer: React.FC<WritingStyleAnalyzerProps> = ({ content, userId }) => {
  const { analyzeStyle, isAnalyzing, analysisResults } = useWritingAnalysis();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (content && isInitialLoad) {
      analyzeStyle(content, userId);
      setIsInitialLoad(false);
    }
  }, [content, analyzeStyle, userId, isInitialLoad]);

  const data = analysisResults ? [
    { name: 'Passive Voice', value: analysisResults.passiveVoicePercentage },
    { name: 'Flesch Reading Ease', value: analysisResults.fleschReadingEase },
    { name: 'Sentiment Score', value: analysisResults.sentimentScore },
  ] : [];

  const formatValue = (value: number, name: string) => {
    if (name === 'Passive Voice' || name === 'Sentiment Score') {
      return `${value.toFixed(2)}%`;
    }
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Writing Style Analysis
        </CardTitle>
        <CardDescription>
          Understand the writing style and quality of your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Analyzing...
          </div>
        ) : analysisResults ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Badge variant="secondary">
                Passive Voice: {analysisResults.passiveVoicePercentage.toFixed(2)}%
              </Badge>
              <Badge variant="secondary">
                Flesch Reading Ease: {analysisResults.fleschReadingEase.toFixed(2)}
              </Badge>
              <Badge variant="secondary">
                Sentiment Score: {analysisResults.sentimentScore.toFixed(2)}
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatValue(value, name), name]} />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" formatter={(value, name) => formatValue(value, name)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No analysis available. Please submit content to analyze.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => analyzeStyle(content, userId)}
          disabled={isAnalyzing}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Re-analyze
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WritingStyleAnalyzer;
