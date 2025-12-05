import { z } from "zod";

// Process status types
export type ProcessStatus = "running" | "crashed" | "frozen" | "high_load";

// Process schema
export const processSchema = z.object({
  pid: z.number(),
  name: z.string(),
  memory: z.number(), // MB
  cpu: z.number(), // percentage
  heartbeat: z.number(), // timestamp
  status: z.enum(["running", "crashed", "frozen", "high_load"]),
});

export type Process = z.infer<typeof processSchema>;

export const insertProcessSchema = processSchema.omit({ pid: true });
export type InsertProcess = z.infer<typeof insertProcessSchema>;

// File schema
export const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  size: z.number(), // bytes
  checksum: z.string(),
  corrupted: z.boolean(),
  lastModified: z.number(), // timestamp
});

export type SystemFile = z.infer<typeof fileSchema>;

export const insertFileSchema = fileSchema.omit({ id: true });
export type InsertFile = z.infer<typeof insertFileSchema>;

// Log entry schema
export type LogType = "info" | "warning" | "error" | "success";

export const logSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.enum(["info", "warning", "error", "success"]),
  event: z.string(),
  description: z.string(),
});

export type LogEntry = z.infer<typeof logSchema>;

export const insertLogSchema = logSchema.omit({ id: true, timestamp: true });
export type InsertLog = z.infer<typeof insertLogSchema>;

// System health schema
export const systemHealthSchema = z.object({
  cpuUsage: z.number(), // percentage
  memoryUsage: z.number(), // percentage
  totalProcesses: z.number(),
  healthyProcesses: z.number(),
  faultyProcesses: z.number(),
  totalFiles: z.number(),
  corruptedFiles: z.number(),
  status: z.enum(["healthy", "warning", "critical"]),
  lastUpdated: z.number(),
});

export type SystemHealth = z.infer<typeof systemHealthSchema>;

// Fault detection result
export const faultSchema = z.object({
  type: z.enum(["crash", "freeze", "high_load", "corruption", "missing_file"]),
  targetId: z.union([z.number(), z.string()]),
  targetName: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
});

export type Fault = z.infer<typeof faultSchema>;

// Heal action result
export const healResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  targetId: z.union([z.number(), z.string()]),
  targetName: z.string(),
  message: z.string(),
});

export type HealResult = z.infer<typeof healResultSchema>;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// System state for full dashboard
export interface SystemState {
  processes: Process[];
  files: SystemFile[];
  logs: LogEntry[];
  health: SystemHealth;
}
