import { randomUUID } from "crypto";
import type { 
  Process, 
  SystemFile, 
  LogEntry, 
  SystemHealth,
  InsertLog,
  Fault,
  HealResult,
  SystemState
} from "@shared/schema";

// Process names for simulation
const PROCESS_NAMES = [
  "kernel_scheduler",
  "memory_manager",
  "file_system_watcher",
  "network_handler",
  "user_session_manager",
  "security_monitor",
  "log_collector",
  "backup_service",
  "cache_manager",
  "disk_io_handler"
];

// File names for simulation
const FILE_TEMPLATES = [
  { name: "config.json", path: "/etc/system/config.json", size: 2048 },
  { name: "kernel.log", path: "/var/log/kernel.log", size: 45000 },
  { name: "auth.db", path: "/var/data/auth.db", size: 128000 },
  { name: "cache.dat", path: "/tmp/cache.dat", size: 65536 },
  { name: "network.conf", path: "/etc/network/network.conf", size: 1024 },
  { name: "security.key", path: "/etc/security/security.key", size: 512 },
  { name: "backup.tar", path: "/var/backup/backup.tar", size: 256000 },
  { name: "users.json", path: "/etc/users/users.json", size: 4096 },
];

function generateChecksum(): string {
  return randomUUID().replace(/-/g, "").slice(0, 32);
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export interface IStorage {
  // Process operations
  getProcesses(): Promise<Process[]>;
  updateProcess(pid: number, updates: Partial<Process>): Promise<Process | undefined>;
  
  // File operations
  getFiles(): Promise<SystemFile[]>;
  updateFile(id: string, updates: Partial<SystemFile>): Promise<SystemFile | undefined>;
  
  // Log operations
  getLogs(): Promise<LogEntry[]>;
  addLog(log: InsertLog): Promise<LogEntry>;
  
  // System health
  getHealth(): Promise<SystemHealth>;
  
  // Full state
  getSystemState(): Promise<SystemState>;
  
  // Fault operations
  injectFaults(): Promise<Fault[]>;
  healFaults(): Promise<HealResult[]>;
  repairFile(fileId: string): Promise<HealResult>;
  
  // Initialize system
  initializeSystem(): Promise<void>;
}

export class MemStorage implements IStorage {
  private processes: Map<number, Process>;
  private files: Map<string, SystemFile>;
  private logs: LogEntry[];
  private initialized: boolean = false;
  private nextPid: number = 1001;

  constructor() {
    this.processes = new Map();
    this.files = new Map();
    this.logs = [];
    this.initializeSystem();
  }

  async initializeSystem(): Promise<void> {
    if (this.initialized) return;

    // Initialize processes
    for (let i = 0; i < 6; i++) {
      const pid = this.nextPid++;
      const process: Process = {
        pid,
        name: PROCESS_NAMES[i % PROCESS_NAMES.length],
        memory: randomBetween(50, 500),
        cpu: randomBetween(1, 30),
        heartbeat: Date.now(),
        status: "running",
      };
      this.processes.set(pid, process);
    }

    // Initialize files
    for (const template of FILE_TEMPLATES) {
      const id = randomUUID();
      const file: SystemFile = {
        id,
        name: template.name,
        path: template.path,
        size: template.size,
        checksum: generateChecksum(),
        corrupted: false,
        lastModified: Date.now() - Math.floor(Math.random() * 86400000),
      };
      this.files.set(id, file);
    }

    // Add initial log
    await this.addLog({
      type: "info",
      event: "System Initialized",
      description: "Self-Healing OS Simulator started successfully. All systems operational.",
    });

    this.initialized = true;

    // Start background simulation
    this.startSimulation();
  }

  private startSimulation(): void {
    // Simulate process metrics changing every 2 seconds
    setInterval(() => {
      for (const process of this.processes.values()) {
        if (process.status === "running") {
          process.cpu = Math.max(0.5, Math.min(99, process.cpu + randomBetween(-5, 5)));
          process.memory = Math.max(10, Math.min(900, process.memory + randomBetween(-20, 20)));
          process.heartbeat = Date.now();
        }
      }
    }, 2000);
  }

  async getProcesses(): Promise<Process[]> {
    return Array.from(this.processes.values());
  }

  async updateProcess(pid: number, updates: Partial<Process>): Promise<Process | undefined> {
    const process = this.processes.get(pid);
    if (process) {
      Object.assign(process, updates);
      return process;
    }
    return undefined;
  }

  async getFiles(): Promise<SystemFile[]> {
    return Array.from(this.files.values());
  }

  async updateFile(id: string, updates: Partial<SystemFile>): Promise<SystemFile | undefined> {
    const file = this.files.get(id);
    if (file) {
      Object.assign(file, updates);
      return file;
    }
    return undefined;
  }

  async getLogs(): Promise<LogEntry[]> {
    // Return last 50 logs, newest first
    return this.logs.slice(-50).reverse();
  }

  async addLog(log: InsertLog): Promise<LogEntry> {
    const entry: LogEntry = {
      id: randomUUID(),
      timestamp: Date.now(),
      ...log,
    };
    this.logs.push(entry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
    
    return entry;
  }

  async getHealth(): Promise<SystemHealth> {
    const processes = await this.getProcesses();
    const files = await this.getFiles();

    const totalProcesses = processes.length;
    const healthyProcesses = processes.filter(p => p.status === "running").length;
    const faultyProcesses = totalProcesses - healthyProcesses;
    const corruptedFiles = files.filter(f => f.corrupted).length;

    // Calculate average CPU and memory usage
    const avgCpu = processes.length > 0
      ? processes.reduce((sum, p) => sum + p.cpu, 0) / processes.length
      : 0;
    const avgMemory = processes.length > 0
      ? (processes.reduce((sum, p) => sum + p.memory, 0) / (processes.length * 10))
      : 0;

    // Determine overall status
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (faultyProcesses > 2 || corruptedFiles > 2 || avgCpu > 80) {
      status = "critical";
    } else if (faultyProcesses > 0 || corruptedFiles > 0 || avgCpu > 60) {
      status = "warning";
    }

    return {
      cpuUsage: Math.min(100, avgCpu),
      memoryUsage: Math.min(100, avgMemory),
      totalProcesses,
      healthyProcesses,
      faultyProcesses,
      totalFiles: files.length,
      corruptedFiles,
      status,
      lastUpdated: Date.now(),
    };
  }

  async getSystemState(): Promise<SystemState> {
    const [processes, files, logs, health] = await Promise.all([
      this.getProcesses(),
      this.getFiles(),
      this.getLogs(),
      this.getHealth(),
    ]);

    return { processes, files, logs, health };
  }

  async injectFaults(): Promise<Fault[]> {
    const faults: Fault[] = [];
    const processes = Array.from(this.processes.values());
    const files = Array.from(this.files.values());

    // Randomly inject 1-3 faults
    const numFaults = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numFaults; i++) {
      const faultType = Math.random();

      if (faultType < 0.3 && processes.length > 0) {
        // Crash a random process
        const runningProcesses = processes.filter(p => p.status === "running");
        if (runningProcesses.length > 0) {
          const target = runningProcesses[Math.floor(Math.random() * runningProcesses.length)];
          target.status = "crashed";
          target.cpu = 0;
          
          faults.push({
            type: "crash",
            targetId: target.pid,
            targetName: target.name,
            severity: "high",
            description: `Process ${target.name} (PID: ${target.pid}) has crashed.`,
          });

          await this.addLog({
            type: "error",
            event: "Process Crashed",
            description: `Process ${target.name} (PID: ${target.pid}) has crashed unexpectedly.`,
          });
        }
      } else if (faultType < 0.5 && processes.length > 0) {
        // Freeze a random process
        const runningProcesses = processes.filter(p => p.status === "running");
        if (runningProcesses.length > 0) {
          const target = runningProcesses[Math.floor(Math.random() * runningProcesses.length)];
          target.status = "frozen";
          target.heartbeat = Date.now() - 60000; // 1 minute ago
          
          faults.push({
            type: "freeze",
            targetId: target.pid,
            targetName: target.name,
            severity: "medium",
            description: `Process ${target.name} (PID: ${target.pid}) is frozen and not responding.`,
          });

          await this.addLog({
            type: "warning",
            event: "Process Frozen",
            description: `Process ${target.name} (PID: ${target.pid}) stopped responding to heartbeat signals.`,
          });
        }
      } else if (faultType < 0.7 && processes.length > 0) {
        // High load on a random process
        const runningProcesses = processes.filter(p => p.status === "running");
        if (runningProcesses.length > 0) {
          const target = runningProcesses[Math.floor(Math.random() * runningProcesses.length)];
          target.status = "high_load";
          target.cpu = randomBetween(85, 99);
          target.memory = randomBetween(700, 900);
          
          faults.push({
            type: "high_load",
            targetId: target.pid,
            targetName: target.name,
            severity: "medium",
            description: `Process ${target.name} (PID: ${target.pid}) is experiencing high resource usage.`,
          });

          await this.addLog({
            type: "warning",
            event: "High Load Detected",
            description: `Process ${target.name} (PID: ${target.pid}) CPU at ${target.cpu.toFixed(1)}%, Memory at ${target.memory.toFixed(1)}MB.`,
          });
        }
      } else if (files.length > 0) {
        // Corrupt a random file
        const healthyFiles = files.filter(f => !f.corrupted);
        if (healthyFiles.length > 0) {
          const target = healthyFiles[Math.floor(Math.random() * healthyFiles.length)];
          target.corrupted = true;
          target.checksum = "CORRUPTED_" + target.checksum.slice(10);
          
          faults.push({
            type: "corruption",
            targetId: target.id,
            targetName: target.name,
            severity: "high",
            description: `File ${target.name} at ${target.path} has been corrupted.`,
          });

          await this.addLog({
            type: "error",
            event: "File Corrupted",
            description: `File ${target.name} at ${target.path} checksum mismatch detected.`,
          });
        }
      }
    }

    if (faults.length === 0) {
      await this.addLog({
        type: "info",
        event: "Fault Injection",
        description: "Attempted fault injection but all systems are already faulty or no valid targets found.",
      });
    }

    return faults;
  }

  async healFaults(): Promise<HealResult[]> {
    const results: HealResult[] = [];
    const processes = Array.from(this.processes.values());
    const files = Array.from(this.files.values());

    // Heal crashed processes
    for (const process of processes) {
      if (process.status === "crashed") {
        process.status = "running";
        process.cpu = randomBetween(5, 25);
        process.memory = randomBetween(50, 200);
        process.heartbeat = Date.now();

        results.push({
          success: true,
          action: "restart",
          targetId: process.pid,
          targetName: process.name,
          message: `Process ${process.name} (PID: ${process.pid}) has been restarted.`,
        });

        await this.addLog({
          type: "success",
          event: "Process Restarted",
          description: `Successfully restarted crashed process ${process.name} (PID: ${process.pid}).`,
        });
      }
    }

    // Heal frozen processes
    for (const process of processes) {
      if (process.status === "frozen") {
        process.status = "running";
        process.heartbeat = Date.now();

        results.push({
          success: true,
          action: "unfreeze",
          targetId: process.pid,
          targetName: process.name,
          message: `Process ${process.name} (PID: ${process.pid}) heartbeat has been reset.`,
        });

        await this.addLog({
          type: "success",
          event: "Process Unfrozen",
          description: `Successfully unfroze process ${process.name} (PID: ${process.pid}) and restored heartbeat.`,
        });
      }
    }

    // Heal high load processes
    for (const process of processes) {
      if (process.status === "high_load") {
        process.status = "running";
        process.cpu = randomBetween(10, 40);
        process.memory = randomBetween(100, 300);

        results.push({
          success: true,
          action: "optimize",
          targetId: process.pid,
          targetName: process.name,
          message: `Process ${process.name} (PID: ${process.pid}) load has been optimized.`,
        });

        await this.addLog({
          type: "success",
          event: "Load Optimized",
          description: `Successfully optimized high-load process ${process.name} (PID: ${process.pid}).`,
        });
      }
    }

    // Heal corrupted files
    for (const file of files) {
      if (file.corrupted) {
        file.corrupted = false;
        file.checksum = generateChecksum();
        file.lastModified = Date.now();

        results.push({
          success: true,
          action: "restore",
          targetId: file.id,
          targetName: file.name,
          message: `File ${file.name} has been restored from backup.`,
        });

        await this.addLog({
          type: "success",
          event: "File Restored",
          description: `Successfully restored corrupted file ${file.name} at ${file.path}.`,
        });
      }
    }

    if (results.length === 0) {
      await this.addLog({
        type: "info",
        event: "System Check",
        description: "No faults detected. All systems are operating normally.",
      });
    }

    return results;
  }

  async repairFile(fileId: string): Promise<HealResult> {
    const file = this.files.get(fileId);
    
    if (!file) {
      return {
        success: false,
        action: "repair",
        targetId: fileId,
        targetName: "Unknown",
        message: "File not found.",
      };
    }

    if (!file.corrupted) {
      return {
        success: false,
        action: "repair",
        targetId: fileId,
        targetName: file.name,
        message: "File is not corrupted.",
      };
    }

    file.corrupted = false;
    file.checksum = generateChecksum();
    file.lastModified = Date.now();

    await this.addLog({
      type: "success",
      event: "File Repaired",
      description: `Successfully repaired file ${file.name} at ${file.path}. New checksum generated.`,
    });

    return {
      success: true,
      action: "repair",
      targetId: fileId,
      targetName: file.name,
      message: `File ${file.name} has been successfully repaired.`,
    };
  }
}

export const storage = new MemStorage();
