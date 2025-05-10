
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gauge, GraduationCap, Star, Award, TrendingUp } from "lucide-react";

interface WritingMetric {
  name: string;
  score: number;
  previousScore: number;
  improvement: number;
}

interface WritingAchievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress: number;
  icon: React.ReactNode;
}

interface WritingImprovementDashboardProps {
  metrics?: WritingMetric[];
  achievements?: WritingAchievement[];
  overallScore?: number;
  previousOverallScore?: number;
}

const defaultMetrics: WritingMetric[] = [
  { name: "Varied Sentence Structure", score: 78, previousScore: 65, improvement: 13 },
  { name: "Active Voice Usage", score: 82, previousScore: 75, improvement: 7 },
  { name: "Vocabulary Diversity", score: 63, previousScore: 58, improvement: 5 },
  { name: "Conciseness", score: 70, previousScore: 72, improvement: -2 },
];

const defaultAchievements: WritingAchievement[] = [
  {
    id: "vocab-master",
    name: "Vocabulary Master",
    description: "Use 50 unique advanced words",
    earned: true,
    progress: 100,
    icon: <GraduationCap className="h-5 w-5" />
  },
  {
    id: "sentence-pro",
    name: "Sentence Pro",
    description: "Achieve 80% sentence variety",
    earned: false,
    progress: 70,
    icon: <Star className="h-5 w-5" />
  },
  {
    id: "clarity-champion",
    name: "Clarity Champion",
    description: "Maintain 90%+ readability for 5 documents",
    earned: false,
    progress: 60,
    icon: <Award className="h-5 w-5" />
  },
  {
    id: "consistent-improver",
    name: "Consistent Improver",
    description: "Improve writing score 3 times in a row",
    earned: true,
    progress: 100,
    icon: <TrendingUp className="h-5 w-5" />
  }
];

const WritingImprovementDashboard: React.FC<WritingImprovementDashboardProps> = ({ 
  metrics = defaultMetrics,
  achievements = defaultAchievements,
  overallScore = 75,
  previousOverallScore = 68
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return "text-green-500";
    if (improvement < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gauge className="mr-2 h-5 w-5" />
          Writing Improvement Dashboard
        </CardTitle>
        <CardDescription>
          Track your writing skills progress and achievements
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Writing Health</span>
              <div className="flex items-center">
                <span className={`font-bold text-lg ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </span>
                {overallScore !== previousOverallScore && (
                  <span className={`ml-2 text-xs font-medium ${getImprovementColor(overallScore - previousOverallScore)}`}>
                    {overallScore > previousOverallScore ? "↑" : "↓"} 
                    {Math.abs(overallScore - previousOverallScore)}%
                  </span>
                )}
              </div>
            </div>
            <Progress value={overallScore} className="h-2.5" />
          </div>
          
          {/* Writing Metrics */}
          <div>
            <h3 className="text-sm font-medium mb-3">Writing Metrics</h3>
            <div className="space-y-3">
              {metrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>{metric.name}</span>
                    <div className="flex items-center">
                      <span className={getScoreColor(metric.score)}>
                        {metric.score}%
                      </span>
                      {metric.improvement !== 0 && (
                        <span className={`ml-2 text-xs ${getImprovementColor(metric.improvement)}`}>
                          {metric.improvement > 0 ? "↑" : "↓"} 
                          {Math.abs(metric.improvement)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Writing Achievements */}
          <div>
            <h3 className="text-sm font-medium mb-3">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`border rounded-md p-3 ${achievement.earned ? 'bg-secondary/20' : 'bg-background'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {achievement.icon}
                    <div>
                      <p className="font-medium text-sm">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    
                    {achievement.earned && (
                      <Badge variant="secondary" className="ml-auto">
                        Earned
                      </Badge>
                    )}
                  </div>
                  
                  {!achievement.earned && (
                    <>
                      <Progress value={achievement.progress} className="h-1 mt-2" />
                      <p className="text-xs text-right mt-1 text-muted-foreground">
                        {achievement.progress}% complete
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WritingImprovementDashboard;
