
import { 
  BookOpen, 
  Award, 
  MessageSquare, 
  HelpCircle 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SourceQualityIndicatorProps {
  type: "academic" | "trusted" | "blog" | "unknown";
}

export const SourceQualityIndicator = ({ type }: SourceQualityIndicatorProps) => {
  const getSourceInfo = () => {
    switch (type) {
      case "academic":
        return {
          icon: <BookOpen size={14} className="text-blue-600" />,
          label: "Academic",
          description: "Peer-reviewed academic source with high reliability"
        };
      case "trusted":
        return {
          icon: <Award size={14} className="text-green-600" />,
          label: "Trusted Publication",
          description: "Established and reputable publication source"
        };
      case "blog":
        return {
          icon: <MessageSquare size={14} className="text-amber-500" />,
          label: "Blog/Forum",
          description: "Content from blogs, forums or non-peer reviewed sources"
        };
      default:
        return {
          icon: <HelpCircle size={14} className="text-gray-500" />,
          label: "Unknown Source",
          description: "Source type could not be determined"
        };
    }
  };

  const { icon, label, description } = getSourceInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded">
            {icon} {label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SourceQualityIndicator;
