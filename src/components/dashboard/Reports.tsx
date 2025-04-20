
import { PlagiarismReport } from "@/hooks/use-plagiarism-reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadReport } from "@/utils/report-utils";

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
            <TableCell>{report.score}%</TableCell>
            <TableCell>{report.word_count}</TableCell>
            <TableCell>{report.status}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadReport(report)}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
