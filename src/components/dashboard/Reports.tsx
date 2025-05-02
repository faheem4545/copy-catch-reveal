
import { PlagiarismReport } from "@/hooks/use-plagiarism-reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { downloadReport } from "@/utils/report-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportsProps {
  reports: PlagiarismReport[];
  isLoading?: boolean;
}

export const Reports = ({ reports, isLoading }: ReportsProps) => {
  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-center py-8 text-gray-500">No plagiarism reports found</div>;
  }

  return (
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
