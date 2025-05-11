
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, MessagesSquare, Share2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Comment {
  id: string;
  user_id: string;
  report_id: string;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface CollaborativeReportsProps {
  reportId?: string;
  reportTitle?: string;
}

const CollaborativeReports: React.FC<CollaborativeReportsProps> = ({ 
  reportId, 
  reportTitle = "Untitled Report"
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [collaborators, setCollaborators] = useState<{id: string, name: string, avatar?: string}[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  
  // Fetch comments for the current report
  useEffect(() => {
    if (!reportId) return;
    
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('report_comments')
          .select(`
            id, 
            user_id, 
            report_id, 
            comment, 
            created_at,
            profiles:user_id (name)
          `)
          .eq('report_id', reportId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Transform the data to include user information
        const commentsWithUserInfo = data.map((comment: any) => ({
          ...comment,
          user_name: comment.profiles?.name || 'Unknown User',
        }));
        
        setComments(commentsWithUserInfo);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Failed to load comments",
          description: "There was a problem loading the comments.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
    
    // Set up realtime subscription for new comments
    const commentsSubscription = supabase
      .channel('report_comments_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'report_comments',
        filter: `report_id=eq.${reportId}`
      }, payload => {
        // Fetch the user info for the new comment
        supabase
          .from('profiles')
          .select('name')
          .eq('id', payload.new.user_id)
          .single()
          .then(({ data }) => {
            const newComment = {
              ...payload.new,
              user_name: data?.name || 'Unknown User'
            };
            setComments(prev => [...prev, newComment]);
          });
      })
      .subscribe();
    
    // Fetch collaborators
    if (reportId) {
      supabase
        .from('report_collaborators')
        .select(`
          user_id,
          profiles:user_id (id, name)
        `)
        .eq('report_id', reportId)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching collaborators:', error);
            return;
          }
          
          if (data) {
            const collaboratorsData = data.map(item => ({
              id: item.profiles.id,
              name: item.profiles.name,
            }));
            setCollaborators(collaboratorsData);
          }
        });
    }
    
    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [reportId, toast]);
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !reportId || !user) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('report_comments')
        .insert({
          report_id: reportId,
          user_id: user.id,
          comment: newComment.trim()
        });
      
      if (error) throw error;
      
      setNewComment("");
      
      // The comment will be added via the subscription
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to add comment",
        description: "There was a problem adding your comment.",
        variant: "destructive"
      });
    }
  };
  
  const handleShareReport = async () => {
    if (!reportId || !shareEmail.trim() || !user) {
      return;
    }
    
    setIsSharing(true);
    
    try {
      // First check if user exists with this email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('email', shareEmail.trim())
        .single();
      
      if (userError) {
        toast({
          title: "User not found",
          description: "No user found with this email address.",
          variant: "destructive"
        });
        return;
      }
      
      // Add collaborator
      const { error } = await supabase
        .from('report_collaborators')
        .insert({
          report_id: reportId,
          user_id: userData.id,
          added_by: user.id
        });
      
      if (error) throw error;
      
      // Update collaborators list
      setCollaborators(prev => [...prev, {
        id: userData.id,
        name: userData.name
      }]);
      
      setShareEmail("");
      
      toast({
        title: "Report shared",
        description: `The report has been shared with ${shareEmail}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      toast({
        title: "Failed to share report",
        description: "There was a problem sharing the report.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
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
