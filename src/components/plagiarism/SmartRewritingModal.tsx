
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SmartContentRewriter from "./SmartContentRewriter";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-background rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">AI-Powered Content Rewriter</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <SmartContentRewriter
            flaggedPassage={flaggedText}
            originalContext={originalContext}
            onRewriteSelected={onRewriteSelected}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartRewritingModal;
