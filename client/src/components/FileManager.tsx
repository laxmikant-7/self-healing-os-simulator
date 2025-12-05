import { motion, AnimatePresence } from "framer-motion";
import { 
  File, 
  FileWarning, 
  Folder, 
  HardDrive, 
  RefreshCw,
  Shield,
  FileCheck
} from "lucide-react";
import type { SystemFile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileManagerProps {
  files: SystemFile[];
  isLoading?: boolean;
  onRepairFile: (fileId: string) => void;
  isRepairing?: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string, corrupted: boolean) {
  if (corrupted) {
    return (
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <FileWarning className="w-5 h-5 text-status-critical" />
      </motion.div>
    );
  }
  
  const ext = name.split(".").pop()?.toLowerCase();
  if (["js", "ts", "jsx", "tsx", "py", "go", "rs"].includes(ext || "")) {
    return <File className="w-5 h-5 text-status-info" />;
  }
  if (["json", "yaml", "yml", "toml", "xml"].includes(ext || "")) {
    return <File className="w-5 h-5 text-status-warning" />;
  }
  if (["md", "txt", "log"].includes(ext || "")) {
    return <File className="w-5 h-5 text-muted-foreground" />;
  }
  return <File className="w-5 h-5 text-muted-foreground" />;
}

function FileManagerSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-muted/50 rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function FileManager({ files, isLoading, onRepairFile, isRepairing }: FileManagerProps) {
  if (isLoading) {
    return <FileManagerSkeleton />;
  }

  const corruptedCount = files.filter((f) => f.corrupted).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">File Manager</h2>
        </div>
        <div className="flex items-center gap-2">
          {corruptedCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {corruptedCount} corrupted
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {files.length} files
          </Badge>
        </div>
      </div>

      <div className="space-y-1 max-h-[280px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No files in system</p>
            </div>
          ) : (
            files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  file.corrupted
                    ? "bg-destructive/10 border border-destructive/20"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file.name, file.corrupted)}
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate ${file.corrupted ? "text-destructive" : ""}`}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {file.path}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground/70 truncate max-w-[80px]">
                      {file.checksum.slice(0, 8)}...
                    </p>
                  </div>
                  
                  {file.corrupted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRepairFile(file.id)}
                      disabled={isRepairing === file.id}
                      className="gap-1.5 border-status-healthy/50 text-status-healthy hover:bg-status-healthy/10"
                      data-testid={`button-repair-file-${file.id}`}
                    >
                      {isRepairing === file.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </motion.div>
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Repair</span>
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-status-healthy/10 text-status-healthy border-status-healthy/30">
                      <FileCheck className="w-3 h-3 mr-1" />
                      OK
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
