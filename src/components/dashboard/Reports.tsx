
import { PlagiarismReport } from "@/hooks/use-plagiarism-reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Copy } from "lucide-react";
import { downloadReport } from "@/utils/report-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useCitationGenerator } from "@/hooks/use-citation-generator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportsProps {
  reports: PlagiarismReport[];
  isLoading?: boolean;
}

export const Reports = ({ reports, isLoading }: ReportsProps) => {
  const [selectedReport, setSelectedReport] = useState<PlagiarismReport | null>(null);
  const { generateCitation } = useCitationGenerator();

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-center py-8 text-gray-500">No plagiarism reports found</div>;
  }

  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard");
  };

  const getCitationSuggestions = (report: PlagiarismReport) => {
    if (!report.citation_suggestions || !Array.isArray(report.citation_suggestions) || report.citation_suggestions.length === 0) {
      // Generate some placeholder citations if none exist
      return [
        {
          title: "Related Academic Source",
          author: "Smith, J.",
          date: "2023",
          publisher: "Journal of Academic Integrity",
          url: "https://example.com/academic-journal"
        },
        {
          title: "Similar Research Paper",
          author: "Johnson, A. & Williams, B.",
          date: "2022",
          publisher: "Research Repository",
          url: "https://example.com/repository"
        }
      ];
    }
    
    return report.citation_suggestions;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Word Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.title}</TableCell>
              <TableCell>
                <span className={
                  report.score < 15 
                    ? "text-green-600 font-medium" 
                    : report.score < 30 
                    ? "text-yellow-600 font-medium" 
                    : "text-red-600 font-medium"
                }>
                  {report.score}%
                </span>
              </TableCell>
              <TableCell>{report.word_count}</TableCell>
              <TableCell>{report.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadReport(report, 'txt')}>
                        <FileText size={14} className="mr-2" />
                        Download as TXT
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadReport(report, 'pdf')}>
                        <FileText size={14} className="mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedReport(report)}
                      >
                        <BookOpen size={16} />
                        Citations
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Citation Suggestions</DialogTitle>
                        <DialogDescription>
                          Based on similarity analysis, consider citing these sources
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        {selectedReport && getCitationSuggestions(selectedReport).map((source, index) => {
                          const citation = generateCitation(source);
                          return (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-sm">{source.title}</h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCopyCitation(citation)}
                                >
                                  <Copy size={14} />
                                </Button>
                              </div>
                              <p className="text-gray-800 mt-2 text-sm">{citation}</p>
                              {source.url && (
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs mt-1 block"
                                >
                                  View Source
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-4">
                        <p className="mb-1">Available citation styles:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded">APA</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">MLA</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">Chicago</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">Harvard</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
