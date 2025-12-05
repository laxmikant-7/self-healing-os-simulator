import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { SystemHealth } from "@/components/SystemHealth";
import { ProcessTable } from "@/components/ProcessTable";
import { FileManager } from "@/components/FileManager";
import { Logs } from "@/components/Logs";
import type { 
  SystemState, 
  Fault, 
  HealResult, 
  ApiResponse 
} from "@shared/schema";

const POLLING_INTERVAL = 3000; // 3 seconds

export default function Dashboard() {
  const { toast } = useToast();
  const [repairingFileId, setRepairingFileId] = useState<string | null>(null);

  // Fetch system state
  const { data: systemState, isLoading, refetch } = useQuery<SystemState>({
    queryKey: ["/api/state"],
    refetchInterval: POLLING_INTERVAL,
    staleTime: 1000,
  });

  // Inject fault mutation
  const injectFaultMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<ApiResponse<Fault[]>>("POST", "/api/detectFaults");
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/state"] });
      if (data.data && data.data.length > 0) {
        toast({
          title: "Faults Injected",
          description: `${data.data.length} fault(s) detected in the system.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Faults Found",
          description: "The system is running normally.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to inject faults.",
        variant: "destructive",
      });
    },
  });

  // Heal system mutation
  const healSystemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<ApiResponse<HealResult[]>>("POST", "/api/healFaults");
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/state"] });
      if (data.data && data.data.length > 0) {
        const successCount = data.data.filter((r) => r.success).length;
        toast({
          title: "System Healed",
          description: `Successfully healed ${successCount} issue(s).`,
        });
      } else {
        toast({
          title: "Nothing to Heal",
          description: "No issues found in the system.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to heal system.",
        variant: "destructive",
      });
    },
  });

  // Repair file mutation
  const repairFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      setRepairingFileId(fileId);
      const response = await apiRequest<ApiResponse<HealResult>>("POST", "/api/files/repair", { fileId });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/state"] });
      setRepairingFileId(null);
      if (data.data?.success) {
        toast({
          title: "File Repaired",
          description: data.data.message,
        });
      }
    },
    onError: (error) => {
      setRepairingFileId(null);
      toast({
        title: "Error",
        description: "Failed to repair file.",
        variant: "destructive",
      });
    },
  });

  const handleInjectFault = useCallback(() => {
    injectFaultMutation.mutate();
  }, [injectFaultMutation]);

  const handleHealSystem = useCallback(() => {
    healSystemMutation.mutate();
  }, [healSystemMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRepairFile = useCallback((fileId: string) => {
    repairFileMutation.mutate(fileId);
  }, [repairFileMutation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar
        onInjectFault={handleInjectFault}
        onHealSystem={handleHealSystem}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        isHealing={healSystemMutation.isPending}
        isInjecting={injectFaultMutation.isPending}
      />

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Top Section - Health + Processes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1"
          >
            <SystemHealth 
              health={systemState?.health ?? null} 
              isLoading={isLoading && !systemState}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <ProcessTable 
              processes={systemState?.processes ?? []} 
              isLoading={isLoading && !systemState}
            />
          </motion.div>
        </div>

        {/* Bottom Section - Files + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileManager
            files={systemState?.files ?? []}
            isLoading={isLoading && !systemState}
            onRepairFile={handleRepairFile}
            isRepairing={repairingFileId}
          />

          <Logs 
            logs={systemState?.logs ?? []} 
            isLoading={isLoading && !systemState}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>Self-Healing OS Simulator - Real-time monitoring & auto-recovery</p>
      </footer>
    </div>
  );
}
