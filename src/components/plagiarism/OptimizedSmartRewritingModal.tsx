
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load the rewriter component
const SmartContentRewriter = lazy(() => import("./SmartContentRewriter"));

interface OptimizedSmartRewritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedText: string;
  originalContext?: string;
  onRewriteSelected: (original: string, rewritten: string) => void;
}

const OptimizedSmartRewritingModal: React.FC<OptimizedSmartRewritingModalProps> = ({
  isOpen,
  onClose,
  flaggedText,
  originalContext,
  onRewriteSelected
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Reset error state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    // Add a small delay before closing to allow for animations
    setTimeout(() => {
      setError(null);
      setIsLoading(false);
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className={`w-full max-w-3xl bg-background rounded-lg shadow-lg max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">AI-Powered Content Rewriter</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="p-4">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading rewriter...</span>
              </div>
            }>
              <SmartContentRewriter
                flaggedPassage={flaggedText}
                originalContext={originalContext}
                onRewriteSelected={(original, rewritten) => {
                  onRewriteSelected(original, rewritten);
                  handleClose();
                }}
                onClose={handleClose}
                onError={handleError}
                onLoadingChange={setIsLoading}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center p-4 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating rewriting suggestions...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedSmartRewritingModal;
