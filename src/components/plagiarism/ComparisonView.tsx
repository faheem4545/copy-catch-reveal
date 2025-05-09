
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Copy
} from "lucide-react";
import { useCitationGenerator } from "@/hooks/use-citation-generator";
import { toast } from "sonner";

interface Source {
  url: string;
  title: string;
  matchPercentage: number;
  matchedText: string;
  type?: "academic" | "trusted" | "blog" | "unknown";
  publicationDate?: string;
  context?: string;
}

interface ComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  source: Source | null;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  isOpen,
  onClose,
  originalText,
  source
}) => {
  const [highlightedOriginal, setHighlightedOriginal] = useState<React.ReactNode>(null);
  const [highlightedSource, setHighlightedSource] = useState<React.ReactNode>(null);
  const { generateCitation } = useCitationGenerator();

  useEffect(() => {
    if (!source || !originalText) return;
    
    // Find the matching section in the original text
    const matchingText = source.matchedText;
    const sourceContext = source.context || '';
    
    // Create highlighted versions of both texts
    setHighlightedOriginal(highlightTextMatches(originalText, matchingText));
    setHighlightedSource(highlightTextMatches(sourceContext, matchingText));
  }, [originalText, source]);

  // Function to highlight matching text
  const highlightTextMatches = (fullText: string, matchText: string) => {
    if (!matchText || !fullText) return <div>{fullText}</div>;
    
    // Simple text-based highlighting
    try {
      const escapedMatchText = matchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedMatchText})`, 'gi');
      const parts = fullText.split(regex);
      
      return (
        <div className="text-sm leading-relaxed">
          {parts.map((part, i) => 
            regex.test(part) ? 
              <span key={i} className="bg-yellow-200 px-1">{part}</span> : 
              <span key={i}>{part}</span>
          )}
        </div>
      );
    } catch (e) {
      console.error("Error highlighting text:", e);
      return <div>{fullText}</div>;
    }
  };
  
  const handleCopyCitation = () => {
    if (!source) return;
    
    const citation = generateCitation({
      title: source.title,
      url: source.url,
      date: source.publicationDate,
    }, "apa");
    
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard");
  };

  if (!source) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Text Comparison</DialogTitle>
          <DialogDescription>
            Compare your text with the matched source content
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden mt-4">
          {/* Original Text */}
          <div className="flex-1 flex flex-col border rounded-md">
            <div className="p-2 bg-gray-100 font-medium border-b">Your Text</div>
            <ScrollArea className="flex-1 p-3">
              {highlightedOriginal}
            </ScrollArea>
          </div>
          
          {/* Source Text */}
          <div className="flex-1 flex flex-col border rounded-md">
            <div className="p-2 bg-gray-100 font-medium flex items-center justify-between border-b">
              <span>Source Text</span>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-xs flex items-center"
              >
                Visit Source <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div className="px-3 py-2 border-b">
              <h3 className="font-medium text-sm">{source.title}</h3>
              {source.publicationDate && (
                <p className="text-xs text-gray-500">Published: {source.publicationDate}</p>
              )}
            </div>
            <ScrollArea className="flex-1 p-3">
              {highlightedSource || (
                <div className="text-gray-500 italic">
                  No detailed source content available
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleCopyCitation}
            >
              <Copy className="h-4 w-4" /> Copy Citation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonView;
