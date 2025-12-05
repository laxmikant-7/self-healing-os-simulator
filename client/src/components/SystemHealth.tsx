import { motion } from "framer-motion";
import { Cpu, HardDrive, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import type { SystemHealth as SystemHealthType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface SystemHealthProps {
  health: SystemHealthType | null;
  isLoading?: boolean;
}

interface GaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function CircularGauge({ value, label, icon, color }: GaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getGradientId = () => `gradient-${label.toLowerCase().replace(/\s/g, "-")}`;

  const getGradientColors = (percentage: number) => {
    if (percentage >= 80) return ["#ef4444", "#f97316"];
    if (percentage >= 60) return ["#f97316", "#eab308"];
    return ["#22c55e", "#10b981"];
  };

  const [color1, color2] = getGradientColors(value);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="gauge-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function HealthSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
        <div className="h-6 w-20 bg-muted/50 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 bg-muted/30 rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 bg-muted/30 rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SystemHealth({ health, isLoading }: SystemHealthProps) {
  if (isLoading || !health) {
    return <HealthSkeleton />;
  }

  const getStatusBadge = () => {
    switch (health.status) {
      case "healthy":
        return (
          <Badge variant="outline" className="bg-status-healthy/10 text-status-healthy border-status-healthy/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "critical":
        return (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Badge variant="destructive" className="animate-pulse-glow">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Critical
            </Badge>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">System Health</h2>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <CircularGauge
          value={health.cpuUsage}
          label="CPU Usage"
          icon={<Cpu className="w-4 h-4" />}
          color="primary"
        />
        <CircularGauge
          value={health.memoryUsage}
          label="Memory"
          icon={<HardDrive className="w-4 h-4" />}
          color="secondary"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <motion.p
            key={health.totalProcesses}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold"
          >
            {health.totalProcesses}
          </motion.p>
          <p className="text-xs text-muted-foreground">Total Processes</p>
        </div>
        <div className="text-center">
          <motion.p
            key={health.healthyProcesses}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-status-healthy"
          >
            {health.healthyProcesses}
          </motion.p>
          <p className="text-xs text-muted-foreground">Healthy</p>
        </div>
        <div className="text-center">
          <motion.p
            key={health.faultyProcesses}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-status-critical"
          >
            {health.faultyProcesses}
          </motion.p>
          <p className="text-xs text-muted-foreground">Faulty</p>
        </div>
      </div>
    </motion.div>
  );
}
