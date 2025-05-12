
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TourStep {
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'right' | 'bottom' | 'left'>('bottom');

  useEffect(() => {
    if (!isVisible) return;
    
    const positionTooltip = () => {
      const target = document.querySelector(steps[currentStep].target);
      
      if (!target) return;
      
      const targetRect = target.getBoundingClientRect();
      const preferredPlacement = steps[currentStep].placement || 'bottom';
      
      // Calculate position based on preferred placement
      let top: number;
      let left: number;
      let actualPlacement = preferredPlacement;
      
      switch (preferredPlacement) {
        case 'top':
          top = targetRect.top - 10;
          left = targetRect.left + targetRect.width / 2;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.right + 10;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2;
          left = targetRect.left - 10;
          break;
        default:
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2;
          actualPlacement = 'bottom';
      }
      
      setPosition({ top, left });
      setPlacement(actualPlacement);
      
      // Add highlight effect to the target element
      target.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      
      return () => {
        target.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      };
    };
    
    const cleanupTarget = positionTooltip();
    window.addEventListener('resize', positionTooltip);
    
    return () => {
      window.removeEventListener('resize', positionTooltip);
      if (cleanupTarget) cleanupTarget();
    };
  }, [currentStep, steps, isVisible]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingCompleted', 'true');
    if (onComplete) onComplete();
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingCompleted', 'true');
    if (onSkip) onSkip();
  };
  
  if (!isVisible) return null;
  
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    transform: 'translate(-50%, -50%)',
    top: `${position.top}px`,
    left: `${position.left}px`,
  };
  
  const currentTourStep = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card style={tooltipStyle} className="w-80 shadow-lg">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <h3 className="font-bold text-lg mb-2">{currentTourStep.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{currentTourStep.content}</p>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;
