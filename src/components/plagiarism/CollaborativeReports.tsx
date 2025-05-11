
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessagesSquare, Share2, UserPlus } from "lucide-react";
import { useCollaborativeReports } from "@/hooks/use-collaborative-reports";

interface CollaborativeReportsProps {
  reportId?: string;
  reportTitle?: string;
}

const CollaborativeReports: React.FC<CollaborativeReportsProps> = ({ 
  reportId, 
  reportTitle = "Untitled Report"
}) => {
  const [newComment, setNewComment] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const { 
    comments,
    collaborators,
    isLoading,
    isSharing,
    addComment,
    shareReport
  } = useCollaborativeReports(reportId);
  
  const handleAddComment = async () => {
    if (await addComment(newComment)) {
      setNewComment("");
    }
  };
  
  const handleShareReport = async () => {
    if (await shareReport(shareEmail)) {
      setShareEmail("");
    }
  };
  
  if (!reportId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborative Annotations</CardTitle>
          <CardDescription>
            Save a report first to enable collaborative features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-gray-500">
            <Users className="mr-2 h-5 w-5" />
            Collaboration requires a saved report
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessagesSquare className="mr-2 h-5 w-5" />
            Collaborative Annotations
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" /> {collaborators.length} Collaborators
          </Button>
        </CardTitle>
        <CardDescription>
          Discuss and annotate "{reportTitle}" with your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input
            placeholder="Email of collaborator"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="flex-grow"
          />
          <Button
            variant="secondary"
            onClick={handleShareReport}
            disabled={isSharing || !shareEmail.trim()}
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-3 mb-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center p-4 text-gray-500">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>{comment.user_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Add your comment or annotation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="ml-auto"
        >
          Post Comment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CollaborativeReports;
