
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Download, ExternalLink, Trash2, Search } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Mock data for reports
const mockReports = [
  {
    id: 1,
    title: "Research Paper Draft",
    date: "2023-04-12",
    score: 18,
    wordCount: 2450,
    status: "Completed"
  },
  {
    id: 2,
    title: "Essay on Climate Change",
    date: "2023-04-10",
    score: 42,
    wordCount: 1850,
    status: "Completed"
  },
  {
    id: 3,
    title: "Literature Review",
    date: "2023-04-08",
    score: 5,
    wordCount: 3200,
    status: "Completed"
  },
  {
    id: 4,
    title: "Project Proposal",
    date: "2023-04-05",
    score: 0,
    wordCount: 1200,
    status: "Completed"
  },
  {
    id: 5,
    title: "Term Paper",
    date: "2023-04-01",
    score: 22,
    wordCount: 4500,
    status: "Completed"
  }
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState(mockReports);

  // Filter reports based on search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      setFilteredReports(mockReports);
    } else {
      const filtered = mockReports.filter(report => 
        report.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  };

  // Function to get appropriate badge color based on score
  const getScoreBadgeColor = (score: number) => {
    if (score < 15) return "bg-green-500";
    if (score < 30) return "bg-yellow-500";
    if (score < 50) return "bg-orange-500";
    return "bg-red-500";
  };

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
            <CardDescription>All-time checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">{mockReports.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
            <CardDescription>Similarity percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">
                {Math.round(mockReports.reduce((acc, report) => acc + report.score, 0) / mockReports.length)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Words Analyzed</CardTitle>
            <CardDescription>Total content checked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-4" />
              <span className="text-3xl font-bold">
                {mockReports.reduce((acc, report) => acc + report.wordCount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="reports">Reports History</TabsTrigger>
          <TabsTrigger value="stats">Usage Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <CardTitle>Recent Reports</CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Your recent plagiarism reports</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>
                          <Badge className={getScoreBadgeColor(report.score)}>
                            {report.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{report.wordCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No reports found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your plagiarism check usage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Detailed statistics will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Dashboard;
