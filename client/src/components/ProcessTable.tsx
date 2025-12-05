import { motion, AnimatePresence } from "framer-motion";
import { Server, Clock, AlertCircle, CheckCircle, Pause, TrendingUp } from "lucide-react";
import type { Process, ProcessStatus } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProcessTableProps {
  processes: Process[];
  isLoading?: boolean;
}

function getStatusIcon(status: ProcessStatus) {
  switch (status) {
    case "running":
      return <CheckCircle className="w-4 h-4 text-status-healthy" />;
    case "crashed":
      return <AlertCircle className="w-4 h-4 text-status-critical" />;
    case "frozen":
      return <Pause className="w-4 h-4 text-status-warning" />;
    case "high_load":
      return <TrendingUp className="w-4 h-4 text-status-warning" />;
  }
}

function getStatusBadge(status: ProcessStatus) {
  switch (status) {
    case "running":
      return (
        <Badge variant="outline" className="bg-status-healthy/10 text-status-healthy border-status-healthy/30 text-xs">
          Running
        </Badge>
      );
    case "crashed":
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Badge variant="destructive" className="text-xs">
            Crashed
          </Badge>
        </motion.div>
      );
    case "frozen":
      return (
        <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30 text-xs">
          Frozen
        </Badge>
      );
    case "high_load":
      return (
        <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30 text-xs">
          High Load
        </Badge>
      );
  }
}

function formatHeartbeat(timestamp: number) {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function ProcessTableSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-muted/50 rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ProcessTable({ processes, isLoading }: ProcessTableProps) {
  if (isLoading) {
    return <ProcessTableSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Processes</h2>
        <Badge variant="secondary" className="ml-auto text-xs">
          {processes.length} total
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="w-20">PID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Memory</TableHead>
              <TableHead className="text-right">CPU</TableHead>
              <TableHead className="text-center">Heartbeat</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {processes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No processes running
                  </TableCell>
                </TableRow>
              ) : (
                processes.map((process, index) => (
                  <motion.tr
                    key={process.pid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-border/30 ${
                      process.status !== "running"
                        ? "bg-destructive/5"
                        : ""
                    }`}
                  >
                    <TableCell className="font-mono text-sm font-medium">
                      {process.pid}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(process.status)}
                        <span>{process.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <motion.span
                        key={process.memory}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                      >
                        {process.memory.toFixed(1)} MB
                      </motion.span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <motion.span
                        key={process.cpu}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className={
                          process.cpu > 80
                            ? "text-status-critical"
                            : process.cpu > 50
                            ? "text-status-warning"
                            : ""
                        }
                      >
                        {process.cpu.toFixed(1)}%
                      </motion.span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono">{formatHeartbeat(process.heartbeat)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(process.status)}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
