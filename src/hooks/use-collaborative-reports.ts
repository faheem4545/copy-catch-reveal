
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  report_id: string;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export function useCollaborativeReports(reportId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!reportId || !user) return;
    
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
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchCollaborators = async () => {
      try {
        const { data, error } = await supabase
          .from('report_collaborators')
          .select(`
            user_id,
            profiles:user_id (id, name)
          `)
          .eq('report_id', reportId);
        
        if (error) throw error;
        
        if (data) {
          const collaboratorsData = data.map((item: any) => ({
            id: item.profiles.id,
            name: item.profiles.name,
          }));
          setCollaborators(collaboratorsData);
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      }
    };
    
    fetchComments();
    fetchCollaborators();
    
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
              ...(payload.new as Comment),
              user_name: data?.name || 'Unknown User'
            };
            setComments(prev => [...prev, newComment]);
          });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [reportId, user]);
  
  const addComment = async (comment: string) => {
    if (!comment.trim() || !reportId || !user) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('report_comments')
        .insert({
          report_id: reportId,
          user_id: user.id,
          comment: comment.trim()
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
      return false;
    }
  };
  
  const shareReport = async (email: string) => {
    if (!reportId || !email.trim() || !user) {
      return false;
    }
    
    setIsSharing(true);
    
    try {
      // First check if user exists with this email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('email', email.trim())
        .single();
      
      if (userError) {
        toast.error("No user found with this email address");
        return false;
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
      
      toast.success(`The report has been shared with ${email}`);
      return true;
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error("Failed to share report");
      return false;
    } finally {
      setIsSharing(false);
    }
  };
  
  return {
    comments,
    collaborators,
    isLoading,
    isSharing,
    addComment,
    shareReport
  };
}
