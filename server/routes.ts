import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertUserSchema, insertContentSchema, insertFeatureFlagSchema,
  insertAuditLogSchema, insertComplianceReportSchema, insertSystemMetricSchema 
} from "@shared/schema";

// Middleware to check for admin role
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!["super_admin", "regional_admin", "support_agent"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Admin role required" });
  }
  
  next();
};

// Middleware for super admin only actions
const requireSuperAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden: Super Admin role required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // User Management Routes
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      // Parse query parameters for filtering
      const { role, region, status } = req.query;
      const filters: any = {};
      
      if (role) filters.role = role;
      if (region) filters.region = region;
      if (status) filters.status = status;
      
      const users = await storage.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Create audit log for user creation
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "user_creation",
        metadata: { userId: user.id, userRole: user.role }
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // For partial updates
      const updateSchema = insertUserSchema.partial();
      const userData = updateSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create audit log for user update
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "user_update",
        metadata: { userId, updates: Object.keys(userData) }
      });
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      // Create audit log for user deletion
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "user_deletion",
        metadata: { userId, userRole: user.role, userEmail: user.email }
      });
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting user ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Content Moderation Routes
  app.get("/api/contents", requireAdmin, async (req, res) => {
    try {
      // Parse query parameters for filtering
      const { type, status, reported, region } = req.query;
      const filters: any = {};
      
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (reported === 'true') filters.reported = true;
      if (region) filters.region = region;
      
      const contents = await storage.getAllContent(filters);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });
  
  app.put("/api/contents/:id/moderate", requireAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const { status, reason } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid moderation status" });
      }
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const updatedContent = await storage.updateContent(contentId, { status });
      
      // Create audit log for content moderation
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "content_moderation",
        metadata: { contentId, oldStatus: content.status, newStatus: status, reason }
      });
      
      res.json(updatedContent);
    } catch (error) {
      console.error(`Error moderating content ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to moderate content" });
    }
  });
  
  // Feature Flag Routes
  app.get("/api/feature-flags", requireAdmin, async (req, res) => {
    try {
      const featureFlags = await storage.getAllFeatureFlags();
      res.json(featureFlags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      res.status(500).json({ message: "Failed to fetch feature flags" });
    }
  });
  
  app.post("/api/feature-flags", requireSuperAdmin, async (req, res) => {
    try {
      const flagData = {
        ...req.body,
        updatedBy: req.user.id
      };
      
      const parsedData = insertFeatureFlagSchema.parse(flagData);
      const featureFlag = await storage.createFeatureFlag(parsedData);
      
      // Create audit log
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "feature_flag_creation",
        metadata: { flagId: featureFlag.id, flagName: featureFlag.name }
      });
      
      res.status(201).json(featureFlag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feature flag data", errors: error.errors });
      }
      console.error("Error creating feature flag:", error);
      res.status(500).json({ message: "Failed to create feature flag" });
    }
  });
  
  app.put("/api/feature-flags/:id", requireSuperAdmin, async (req, res) => {
    try {
      const flagId = parseInt(req.params.id);
      if (isNaN(flagId)) {
        return res.status(400).json({ message: "Invalid feature flag ID" });
      }
      
      const flagData = {
        ...req.body,
        updatedBy: req.user.id
      };
      
      const updateSchema = insertFeatureFlagSchema.partial();
      const parsedData = updateSchema.parse(flagData);
      
      const flag = await storage.getFeatureFlag(flagId);
      if (!flag) {
        return res.status(404).json({ message: "Feature flag not found" });
      }
      
      const updatedFlag = await storage.updateFeatureFlag(flagId, parsedData);
      
      // Create audit log
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "feature_flag_update",
        metadata: { 
          flagId, 
          flagName: flag.name, 
          oldEnabled: flag.enabled,
          newEnabled: parsedData.enabled !== undefined ? parsedData.enabled : flag.enabled
        }
      });
      
      res.json(updatedFlag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feature flag data", errors: error.errors });
      }
      console.error(`Error updating feature flag ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update feature flag" });
    }
  });
  
  // Compliance Report Routes
  app.get("/api/compliance-reports", requireAdmin, async (req, res) => {
    try {
      const { type, status, region } = req.query;
      const filters: any = {};
      
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (region) filters.region = region;
      
      const reports = await storage.getAllComplianceReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ message: "Failed to fetch compliance reports" });
    }
  });
  
  app.post("/api/compliance-reports/:id/generate", requireAdmin, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ message: "Invalid report ID" });
      }
      
      const report = await storage.getComplianceReport(reportId);
      if (!report) {
        return res.status(404).json({ message: "Compliance report not found" });
      }
      
      // Update last generated timestamp
      const updatedReport = await storage.updateComplianceReport(reportId, {
        lastGenerated: new Date()
      });
      
      // Create audit log
      await storage.createAuditLog({
        adminId: req.user.id,
        action: "compliance_report_generation",
        metadata: { reportId, reportType: report.type }
      });
      
      res.json(updatedReport);
    } catch (error) {
      console.error(`Error generating compliance report ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to generate compliance report" });
    }
  });
  
  // System Metrics Routes
  app.get("/api/metrics", requireAdmin, async (req, res) => {
    try {
      const { type } = req.query;
      const filters: any = {};
      
      if (type) filters.type = type;
      
      const metrics = await storage.getAllSystemMetrics(filters);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });
  
  // Audit Log Routes
  app.get("/api/audit-logs", requireSuperAdmin, async (req, res) => {
    try {
      const { action, adminId } = req.query;
      const filters: any = {};
      
      if (action) filters.action = action;
      if (adminId) filters.adminId = parseInt(adminId as string);
      
      const logs = await storage.getAllAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
