
-- Create table for report comments
CREATE TABLE IF NOT EXISTS public.report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.plagiarism_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for report collaborators
CREATE TABLE IF NOT EXISTS public.report_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.plagiarism_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_by UUID NOT NULL,
  permission VARCHAR(50) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate collaborators
ALTER TABLE public.report_collaborators
ADD CONSTRAINT unique_report_user UNIQUE (report_id, user_id);

-- Enable Row Level Security
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_collaborators ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for report comments
CREATE POLICY "Users can view comments on reports they own or collaborate on" 
ON public.report_comments 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.plagiarism_reports pr 
    WHERE pr.id = report_id AND pr.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.report_collaborators rc 
    WHERE rc.report_id = report_id AND rc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert comments on reports they own or collaborate on" 
ON public.report_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.plagiarism_reports pr 
      WHERE pr.id = report_id AND pr.user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.report_collaborators rc 
      WHERE rc.report_id = report_id AND rc.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.report_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.report_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for report collaborators
CREATE POLICY "Users can view collaborators on reports they own or collaborate on" 
ON public.report_collaborators 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.plagiarism_reports pr 
    WHERE pr.id = report_id AND pr.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.report_collaborators rc 
    WHERE rc.report_id = report_id AND rc.user_id = auth.uid()
  )
);

CREATE POLICY "Report owners can manage collaborators" 
ON public.report_collaborators 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.plagiarism_reports pr 
    WHERE pr.id = report_id AND pr.user_id = auth.uid()
  )
);

-- Enable realtime for comments to support collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_comments;

-- Add email column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;
