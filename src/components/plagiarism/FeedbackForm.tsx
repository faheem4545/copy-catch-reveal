
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string;
  matchPercentage: number;
  sourceUrl: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  open,
  onOpenChange,
  sourceId,
  matchPercentage,
  sourceUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<"accurate" | "partially" | "inaccurate" | null>(null);
  const [comments, setComments] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accuracy) {
      toast.error("Please select an accuracy level");
      return;
    }
    
    setLoading(true);
    
    try {
      // Store the feedback
      const feedback = {
        user_id: user?.id || null,
        source_id: sourceId,
        source_url: sourceUrl,
        match_percentage: matchPercentage,
        accuracy_rating: accuracy,
        comments: comments,
        created_at: new Date().toISOString(),
      };
      
      // In a real app, we would save this to the database
      // For now, we'll just log it to the console
      console.log("Feedback submitted:", feedback);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Thank you for your feedback!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Source Match Feedback</DialogTitle>
          <DialogDescription>
            Help us improve our plagiarism detection by rating the accuracy of this match.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>How accurate was this source match?</Label>
            <RadioGroup value={accuracy || ""} onValueChange={(val: any) => setAccuracy(val)} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accurate" id="accurate" />
                <Label htmlFor="accurate" className="font-normal">Accurate - This is a clear match</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partially" id="partially" />
                <Label htmlFor="partially" className="font-normal">Partially accurate - Some content matches</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inaccurate" id="inaccurate" />
                <Label htmlFor="inaccurate" className="font-normal">Inaccurate - This is not a match</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comments">Additional comments (optional)</Label>
            <Textarea
              id="comments"
              placeholder="Share any details about why you think this match is or isn't accurate..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !accuracy}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
