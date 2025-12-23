import { useAuditLogs } from "@/hooks/use-audit";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function AuditLogs() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Audit Logs</h2>
        <p className="text-muted-foreground">Track system activities and changes.</p>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No activity recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(log.createdAt!), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.targetType} #{log.targetId}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                    {JSON.stringify(log.details)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
