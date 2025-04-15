
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimilarityMeterProps {
  score: number;
}

const SimilarityMeter = ({ score }: SimilarityMeterProps) => {
  // Calculate level and message based on score
  const getLevel = () => {
    if (score < 15) return { level: "Low", message: "Your text appears to be largely original." };
    if (score < 30) return { level: "Moderate", message: "Some portions of your text match existing content." };
    if (score < 50) return { level: "High", message: "Significant portions match existing content." };
    return { level: "Very High", message: "Most of your text matches existing content." };
  };

  // Get color based on score
  const getColor = () => {
    if (score < 15) return "bg-green-600";
    if (score < 30) return "bg-yellow-400";
    if (score < 50) return "bg-orange-500";
    return "bg-red-600";
  };

  const { level, message } = getLevel();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Similarity Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">{score}%</span>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100">
            {level} Similarity
          </span>
        </div>
        <Progress 
          value={score} 
          className="h-2" 
          indicatorClassName={getColor()}
        />
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
};

export default SimilarityMeter;
