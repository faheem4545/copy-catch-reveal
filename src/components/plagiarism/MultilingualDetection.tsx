
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMultilingualDetection } from "@/hooks/use-multilingual-detection";
import { Loader2, Globe, AlertCircle } from "lucide-react";

interface MultilingualDetectionProps {
  content: string;
  onResultsReceived?: (results: any) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
];

const MultilingualDetection: React.FC<MultilingualDetectionProps> = ({ 
  content,
  onResultsReceived 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const { detectPlagiarism, isLoading, results } = useMultilingualDetection();
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!content) return;
    
    const detectionResults = await detectPlagiarism(content, selectedLanguage);
    
    if (detectionResults) {
      setDetectedLanguage(detectionResults.detectedLanguage);
      
      if (onResultsReceived) {
        onResultsReceived(detectionResults);
      }
    }
  };

  const getLanguageName = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          Multilingual Plagiarism Detection
        </CardTitle>
        <CardDescription>
          Detect plagiarism across multiple languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Language</label>
            <Select
              value={selectedLanguage}
              onValueChange={(value) => setSelectedLanguage(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select the language you want to check plagiarism against
            </p>
          </div>
          
          {detectedLanguage && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Detected Language</p>
              <div className="flex items-center mt-1">
                <Badge variant="secondary">
                  {getLanguageName(detectedLanguage)}
                </Badge>
                {detectedLanguage !== selectedLanguage && (
                  <div className="flex items-center ml-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Different from selected language
                  </div>
                )}
              </div>
            </div>
          )}
          
          {results && (
            <div className="p-3 bg-gray-50 rounded-md space-y-2">
              <p className="text-sm font-medium">Results</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Similarity Score:</span>
                  <Badge variant={results.similarityScore > 30 ? "destructive" : "secondary"}>
                    {results.similarityScore.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sources Checked:</span>
                  <span className="text-sm font-medium">{results.sourcesChecked}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDetect}
          disabled={!content || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Detect Plagiarism
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MultilingualDetection;
