import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertReportSchema, insertUpdateSchema } from "@shared/schema";
import multer from "multer";
import { randomBytes } from "crypto";
import path from "path";
import fs from "fs";
import { checkAndAwardBadges, updateUserActivity } from "./badges";

// Setup file upload
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage2,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Administrator rights required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));
  
  // Get reports for current user
  app.get("/api/reports/user", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const reports = await storage.getReportsByUser(req.user.id);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });
  
  // Report routes
  
  // Create new report
  app.post("/api/reports", isAuthenticated, upload.array("photos", 5), async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Parse and validate report data
      const reportData = insertReportSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Create report
      const report = await storage.createReport(reportData);
      
      // Add photos to report if any
      if (files && files.length > 0) {
        for (const file of files) {
          const photoUrl = `/uploads/${file.filename}`;
          await storage.addPhotoToReport(report.id, photoUrl);
        }
        
        // Get updated report with photos
        const updatedReport = await storage.getReport(report.id);
        return res.status(201).json(updatedReport);
      }
      
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all reports (admin only)
  app.get("/api/reports", isAuthenticated, async (req, res, next) => {
    try {
      let reports;
      
      if (req.user.role === "admin") {
        reports = await storage.getAllReports();
      } else {
        reports = await storage.getReportsByUser(req.user.id);
      }
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });
  
  // Get report by ID
  app.get("/api/reports/:id", isAuthenticated, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // If not admin, check if user owns the report
      if (req.user.role !== "admin" && report.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(report);
    } catch (error) {
      next(error);
    }
  });
  
  // Update report status (admin only)
  app.patch("/api/reports/:id/status", isAdmin, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "in-progress", "assigned", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const report = await storage.updateReportStatus(reportId, status);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Add update about status change
      await storage.createUpdate({
        reportId: reportId,
        userId: req.user.id,
        content: `Status updated to ${status}`
      });
      
      res.json(report);
    } catch (error) {
      next(error);
    }
  });
  
  // Assign report (admin only)
  app.patch("/api/reports/:id/assign", isAdmin, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ error: "Assignment information required" });
      }
      
      const report = await storage.updateReportAssignment(reportId, assignedTo);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Add update about assignment
      await storage.createUpdate({
        reportId: reportId,
        userId: req.user.id,
        content: `Issue assigned to ${assignedTo}`
      });
      
      res.json(report);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all updates for a report
  app.get("/api/reports/:id/updates", isAuthenticated, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // If not admin, check if user owns the report
      if (req.user.role !== "admin" && report.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updates = await storage.getUpdatesByReportId(reportId);
      res.json(updates);
    } catch (error) {
      next(error);
    }
  });
  
  // Add update to a report
  app.post("/api/reports/:id/updates", isAuthenticated, async (req, res, next) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // If not admin, check if user owns the report
      if (req.user.role !== "admin" && report.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updateData = insertUpdateSchema.parse({
        reportId,
        userId: req.user.id,
        content: req.body.content
      });
      
      const update = await storage.createUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


