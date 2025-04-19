
import { PlagiarismReport } from "@/hooks/use-plagiarism-reports";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportsProps {
  reports: PlagiarismReport[];
  isLoading: boolean;
}

export function Reports({ reports, isLoading }: ReportsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No plagiarism reports found. Check your first document to get started!</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Words</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.title}</TableCell>
            <TableCell>{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
            <TableCell>
              <Badge 
                className={
                  report.score < 15 
                    ? "bg-green-500" 
                    : report.score < 30 
                    ? "bg-yellow-500" 
                    : report.score < 50 
                    ? "bg-orange-500" 
                    : "bg-red-500"
                }
              >
                {report.score}%
              </Badge>
            </TableCell>
            <TableCell>{report.word_count}</TableCell>
            <TableCell>
              <Badge variant="outline">{report.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
