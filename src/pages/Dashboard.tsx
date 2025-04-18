
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { usePlagiarismReports } from "@/hooks/use-plagiarism-reports";
import { Reports } from "@/components/dashboard/Reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: reports, isLoading: reportsLoading } = usePlagiarismReports();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return null;
  }

  const averageScore = reports?.length
    ? Math.round(reports.reduce((acc, report) => acc + report.score, 0) / reports.length)
    : 0;

  const totalWords = reports?.reduce((acc, report) => acc + report.word_count, 0) || 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-gray-600">Track and manage your plagiarism reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">{reports?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">{averageScore}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Words Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">{totalWords.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Reports reports={reports || []} isLoading={reportsLoading} />
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
