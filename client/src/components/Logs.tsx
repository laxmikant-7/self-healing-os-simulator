import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScrollText, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Clock
} from "lucide-react";
import type { LogEntry, LogType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface LogsProps {
  logs: LogEntry[];
  isLoading?: boolean;
}

function getLogIcon(type: LogType) {
  switch (type) {
    case "info":
      return <Info className="w-4 h-4 text-status-info" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-status-warning" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-status-critical" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-status-success" />;
  }
}

function getLogBadge(type: LogType) {
  switch (type) {
    case "info":
      return (
        <Badge variant="outline" className="text-xs bg-status-info/10 text-status-info border-status-info/30">
          INFO
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="text-xs bg-status-warning/10 text-status-warning border-status-warning/30">
          WARN
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="text-xs">
          ERROR
        </Badge>
      );
    case "success":
      return (
        <Badge variant="outline" className="text-xs bg-status-success/10 text-status-success border-status-success/30">
          SUCCESS
        </Badge>
      );
  }
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function LogsSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-muted/50 rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function Logs({ logs, isLoading }: LogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (isLoading) {
    return <LogsSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">System Logs</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {logs.length} entries
        </Badge>
      </div>

      <div
        ref={scrollRef}
        className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No log entries yet</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-md border transition-colors ${
                  log.type === "error"
                    ? "bg-destructive/5 border-destructive/20"
                    : log.type === "warning"
                    ? "bg-status-warning/5 border-status-warning/20"
                    : log.type === "success"
                    ? "bg-status-success/5 border-status-success/20"
                    : "bg-muted/20 border-border/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getLogIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.event}</span>
                      {getLogBadge(log.type)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
