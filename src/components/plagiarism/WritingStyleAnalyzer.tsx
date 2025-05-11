
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
  const { analyzeWritingStyle, isAnalyzing, analysisResult } = useWritingAnalysis();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (content && isInitialLoad) {
      analyzeWritingStyle(content, userId);
      setIsInitialLoad(false);
    }
  }, [content, analyzeWritingStyle, userId, isInitialLoad]);

  const data = analysisResult ? [
    { name: 'Passive Voice', value: analysisResult.passiveVoicePercentage || 0 },
    { name: 'Flesch Reading Ease', value: analysisResult.fleschReadingEase || 0 },
    { name: 'Sentiment Score', value: analysisResult.sentimentScore || 0 },
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
        ) : analysisResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Badge variant="secondary">
                Passive Voice: {(analysisResult.passiveVoicePercentage || 0).toFixed(2)}%
              </Badge>
              <Badge variant="secondary">
                Flesch Reading Ease: {(analysisResult.fleschReadingEase || 0).toFixed(2)}
              </Badge>
              <Badge variant="secondary">
                Sentiment Score: {(analysisResult.sentimentScore || 0).toFixed(2)}
              </Badge>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatValue(Number(value), String(name)), name]} />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" formatter={(value) => {
                    const val = Number(value);
                    const item = data.find(item => item.value === val);
                    return formatValue(val, item ? item.name : '');
                  }} />
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
          onClick={() => analyzeWritingStyle(content, userId)}
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
