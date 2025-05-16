
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import SmartContentRewriter from "./SmartContentRewriter";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SmartRewritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedText: string;
  originalContext?: string;
  onRewriteSelected: (original: string, rewritten: string) => void;
}

const SmartRewritingModal: React.FC<SmartRewritingModalProps> = ({
  isOpen,
  onClose,
  flaggedText,
  originalContext,
  onRewriteSelected
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-background rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">AI-Powered Content Rewriter</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="p-4">
          <SmartContentRewriter
            flaggedPassage={flaggedText}
            originalContext={originalContext}
            onRewriteSelected={onRewriteSelected}
            onClose={handleClose}
            onError={handleError}
            onLoadingChange={setIsLoading}
          />
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center p-4 border-t">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating rewriting suggestions...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRewritingModal;
