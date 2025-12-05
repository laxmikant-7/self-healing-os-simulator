import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLogSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. GET /api/state - Get full system state (combines all data)
  app.get("/api/state", async (req, res) => {
    try {
      const state = await storage.getSystemState();
      res.json(state);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch system state" });
    }
  });

  // 2. GET /api/processes - Get all processes
  app.get("/api/processes", async (req, res) => {
    try {
      const processes = await storage.getProcesses();
      res.json({ success: true, data: processes });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch processes" });
    }
  });

  // 3. POST /api/processes/update - Update a process
  app.post("/api/processes/update", async (req, res) => {
    try {
      const { pid, ...updates } = req.body;
      if (!pid) {
        return res.status(400).json({ success: false, error: "PID is required" });
      }
      const process = await storage.updateProcess(pid, updates);
      if (!process) {
        return res.status(404).json({ success: false, error: "Process not found" });
      }
      res.json({ success: true, data: process });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update process" });
    }
  });

  // 4. POST /api/detectFaults - Inject faults into the system
  app.post("/api/detectFaults", async (req, res) => {
    try {
      const faults = await storage.injectFaults();
      res.json({ success: true, data: faults });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to detect/inject faults" });
    }
  });

  // 5. POST /api/healFaults - Auto-heal all faults
  app.post("/api/healFaults", async (req, res) => {
    try {
      const results = await storage.healFaults();
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to heal faults" });
    }
  });

  // 6. GET /api/files - Get all system files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch files" });
    }
  });

  // 7. POST /api/files/repair - Repair a specific file
  app.post("/api/files/repair", async (req, res) => {
    try {
      const { fileId } = req.body;
      if (!fileId) {
        return res.status(400).json({ success: false, error: "File ID is required" });
      }
      const result = await storage.repairFile(fileId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to repair file" });
    }
  });

  // 8. GET /api/health - Get system health metrics
  app.get("/api/health", async (req, res) => {
    try {
      const health = await storage.getHealth();
      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch health metrics" });
    }
  });

  // 9. POST /api/logs/add - Add a new log entry
  app.post("/api/logs/add", async (req, res) => {
    try {
      const parseResult = insertLogSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid log data",
          details: parseResult.error.errors 
        });
      }
      const log = await storage.addLog(parseResult.data);
      res.json({ success: true, data: log });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to add log" });
    }
  });

  // 10. GET /api/logs - Get all logs
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch logs" });
    }
  });

  return httpServer;
}
