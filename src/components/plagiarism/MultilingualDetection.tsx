
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe2, Languages, RefreshCw } from "lucide-react";

interface MultilingualDetectionProps {
  content: string;
  onContentProcessed: (processedContent: string, language: string) => void;
}

// Supported languages for plagiarism detection
const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" }
];

const MultilingualDetection: React.FC<MultilingualDetectionProps> = ({ content, onContentProcessed }) => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Function to detect the language of the content
  const detectLanguage = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please provide content for language detection",
        variant: "destructive"
      });
      return;
    }
    
    setIsDetecting(true);
    
    try {
      // In a real implementation, this would call an API to detect the language
      // For now, we'll simulate a detection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated language detection result
      // In production, this would use a language detection service
      const detectedCode = "en"; // Default to English for demo
      
      setDetectedLanguage(detectedCode);
      setSelectedLanguage(detectedCode);
      
      toast({
        title: "Language detected",
        description: `Detected language: ${supportedLanguages.find(l => l.code === detectedCode)?.name || "Unknown"}`,
      });
    } catch (error) {
      console.error('Error detecting language:', error);
      toast({
        title: "Language detection failed",
        description: "Could not detect the language of the content.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };
  
  // Function to process content in the selected language
  const processContentInLanguage = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please provide content for plagiarism detection",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would translate the content if needed
      // and prepare it for plagiarism detection in the specified language
      
      // For now, we'll just pass the original content with the selected language
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onContentProcessed(content, selectedLanguage);
      
      toast({
        title: "Content processed",
        description: `Content prepared for plagiarism detection in ${supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}`,
      });
    } catch (error) {
      console.error('Error processing content:', error);
      toast({
        title: "Processing failed",
        description: "Could not process the content for plagiarism detection.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe2 className="mr-2 h-5 w-5" />
          Multilingual Plagiarism Detection
        </CardTitle>
        <CardDescription>
          Detect plagiarism in multiple languages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Language</label>
            <div className="flex space-x-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Languages</SelectLabel>
                    {supportedLanguages.map(language => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={detectLanguage}
                disabled={isDetecting || !content.trim()}
              >
                {isDetecting ? (
                  <><RefreshCw className="mr-1 h-4 w-4 animate-spin" /> Detecting</>
                ) : (
                  <>Auto-detect</>
                )}
              </Button>
            </div>
          </div>
          
          {detectedLanguage && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm flex items-center">
                <Languages className="h-4 w-4 mr-2 text-blue-600" />
                <span>
                  Detected language: <strong>{supportedLanguages.find(l => l.code === detectedLanguage)?.name || "Unknown"}</strong>
                </span>
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm">
              Content length: <strong>{content.length}</strong> characters
            </p>
            <p className="text-sm mt-1">
              Words: <strong>{content.trim() ? content.trim().split(/\s+/).length : 0}</strong>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={processContentInLanguage}
          disabled={isProcessing || !content.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <>Check Plagiarism in {supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MultilingualDetection;
