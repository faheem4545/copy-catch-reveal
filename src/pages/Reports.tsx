
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useSavedReports } from '@/hooks/use-saved-reports';
import FileUpload from '@/components/plagiarism/FileUpload';
import BatchFileUpload from '@/components/plagiarism/BatchFileUpload';
import { toast } from 'sonner';

export default function Reports() {
  const { user } = useAuth();
  const { reports, isLoading } = useSavedReports();
  const [activeTab, setActiveTab] = useState('recent');
  
  const handleFileSelected = (file: File) => {
    toast.success(`File "${file.name}" uploaded successfully. Processing...`);
    // Here you would call your API to process the file
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="recent" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent Reports</TabsTrigger>
                <TabsTrigger value="shared">Shared With Me</TabsTrigger>
                <TabsTrigger value="all">All Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="mt-6">
                {isLoading ? (
                  <div className="p-8 text-center">Loading your reports...</div>
                ) : reports && reports.length > 0 ? (
                  <div className="grid gap-4">
                    {reports.slice(0, 5).map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle>{report.title}</CardTitle>
                          <CardDescription>
                            Created: {new Date(report.created_at).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-muted-foreground">Similarity Score:</span>
                              <span className="ml-2 font-medium">{report.score}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Word Count:</span>
                              <span className="ml-2 font-medium">{report.word_count}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No reports found. Upload a document to get started.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="shared" className="mt-6">
                <div className="p-8 text-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No shared reports found. Reports shared with you will appear here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="mt-6">
                {isLoading ? (
                  <div className="p-8 text-center">Loading your reports...</div>
                ) : reports && reports.length > 0 ? (
                  <div className="grid gap-4">
                    {reports.map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle>{report.title}</CardTitle>
                          <CardDescription>
                            Created: {new Date(report.created_at).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-muted-foreground">Similarity Score:</span>
                              <span className="ml-2 font-medium">{report.score}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Word Count:</span>
                              <span className="ml-2 font-medium">{report.word_count}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No reports found. Upload a document to get started.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Start New Check</CardTitle>
                <CardDescription>Upload a document to scan for plagiarism</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single File</TabsTrigger>
                    <TabsTrigger value="batch">Batch Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="mt-4">
                    <FileUpload onFileSelected={handleFileSelected} />
                  </TabsContent>
                  <TabsContent value="batch" className="mt-4">
                    <BatchFileUpload />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
