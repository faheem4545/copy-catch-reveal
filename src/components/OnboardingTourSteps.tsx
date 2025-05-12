
import React from 'react';
import OnboardingTour from './ui/OnboardingTour';

interface OnboardingTourWrapperProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTourWrapper: React.FC<OnboardingTourWrapperProps> = ({ 
  isVisible,
  onComplete,
  onSkip
}) => {
  // Define onboarding steps
  const tourSteps = [
    {
      title: "Welcome to PlagScan!",
      content: "This tour will guide you through our plagiarism detection platform's key features.",
      target: "body",
      placement: "top" as const
    },
    {
      title: "Upload Your Content",
      content: "Start by pasting text or uploading a document to check for plagiarism.",
      target: ".file-upload-area",
      placement: "bottom" as const
    },
    {
      title: "Check Multiple Files",
      content: "Use our batch processing feature to check multiple documents at once.",
      target: ".batch-upload-tab",
      placement: "bottom" as const
    },
    {
      title: "Multilingual Support",
      content: "Detect plagiarism across different languages with our advanced algorithms.",
      target: ".multilingual-tab",
      placement: "right" as const
    },
    {
      title: "Review Similarity Results",
      content: "After scanning, see matched content highlighted and get detailed source information.",
      target: ".results-display",
      placement: "top" as const
    },
    {
      title: "Writing Improvement Tools",
      content: "Use our AI-powered tools to improve your writing and avoid plagiarism.",
      target: ".writing-improvement",
      placement: "left" as const
    },
    {
      title: "Collaborate with Others",
      content: "Share reports with teammates or instructors for collaborative review.",
      target: ".collaborative-features",
      placement: "top" as const
    },
    {
      title: "You're All Set!",
      content: "Now you're ready to use PlagScan to check your documents for plagiarism and improve your writing.",
      target: "body",
      placement: "top" as const
    }
  ];

  if (!isVisible) return null;

  return (
    <OnboardingTour 
      steps={tourSteps} 
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
};

export default OnboardingTourWrapper;
