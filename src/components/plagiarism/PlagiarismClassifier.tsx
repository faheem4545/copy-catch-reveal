
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react';

interface PlagiarismClassifierProps {
  similarityScore: number;
  contentLength: number;
}

interface ClassificationResult {
  type: string;
  description: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  icon: React.ReactNode;
  color: string;
}

const PlagiarismClassifier: React.FC<PlagiarismClassifierProps> = ({ 
  similarityScore, 
  contentLength 
}) => {
  // Determine plagiarism classification based on similarity score and content length
  const getClassification = (): ClassificationResult => {
    if (similarityScore <= 5) {
      return {
        type: 'Original Content',
        description: 'The content appears to be original with minimal or no similarity to existing sources.',
        severity: 'none',
        recommendation: 'No action needed. Your content appears to be original.',
        icon: <CheckCircle className="h-6 w-6" />,
        color: 'text-green-500'
      };
    } else if (similarityScore <= 15) {
      return {
        type: 'Minor Similarity',
        description: 'Some phrases may be similar to existing content, but this is likely coincidental or common terminology.',
        severity: 'low',
        recommendation: 'Consider reviewing highlighted sections, but major changes are likely unnecessary.',
        icon: <Info className="h-6 w-6" />,
        color: 'text-blue-500'
      };
    } else if (similarityScore <= 30) {
      return {
        type: 'Patchwriting',
        description: 'The content shows moderate similarity and may include paraphrased sections without proper citation.',
        severity: 'medium',
        recommendation: 'Review highlighted sections and either rewrite in your own words or add proper citations.',
        icon: <HelpCircle className="h-6 w-6" />,
        color: 'text-yellow-500'
      };
    } else if (similarityScore <= 60) {
      return {
        type: 'Substantial Plagiarism',
        description: 'Significant portions of the content appear to be similar to existing sources without proper attribution.',
        severity: 'high',
        recommendation: 'Extensive revision is needed. Use the paraphrasing tool to rewrite sections and add citations where appropriate.',
        icon: <AlertTriangle className="h-6 w-6" />,
        color: 'text-orange-500'
      };
    } else {
      return {
        type: 'Critical Plagiarism',
        description: 'The content contains extensive verbatim or near-verbatim duplication of existing sources.',
        severity: 'critical',
        recommendation: 'Complete rewrite is necessary. Consider starting over with original ideas or properly quoting and citing all borrowed content.',
        icon: <AlertTriangle className="h-6 w-6" />,
        color: 'text-red-500'
      };
    }
  };

  const classification = getClassification();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plagiarism Classification</CardTitle>
        <CardDescription>Analysis of detected plagiarism type and severity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className={classification.color}>
            {classification.icon}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{classification.type}</h3>
            <p className="text-sm text-muted-foreground">{classification.description}</p>
            
            <div className="mt-3">
              <div className="font-medium text-sm">Recommendation:</div>
              <p className="text-sm mt-1">{classification.recommendation}</p>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <div className="text-sm font-medium">Severity:</div>
              <div className={`px-2 py-0.5 text-xs rounded-full ${
                classification.severity === 'none' ? 'bg-green-100 text-green-800' :
                classification.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                classification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                classification.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {classification.severity.charAt(0).toUpperCase() + classification.severity.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlagiarismClassifier;
