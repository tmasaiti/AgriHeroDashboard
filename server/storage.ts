import { 
  users, type User, type InsertUser,
  contents, type Content, type InsertContent,
  featureFlags, type FeatureFlag, type InsertFeatureFlag,
  auditLogs, type AuditLog, type InsertAuditLog,
  complianceReports, type ComplianceReport, type InsertComplianceReport,
  systemMetrics, type SystemMetric, type InsertSystemMetric
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(filters?: Partial<User>): Promise<User[]>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
  getAllContent(filters?: Partial<Content>): Promise<Content[]>;
  
  // Feature flag operations
  getFeatureFlag(id: number): Promise<FeatureFlag | undefined>;
  getFeatureFlagByName(name: string): Promise<FeatureFlag | undefined>;
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: number, flag: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined>;
  deleteFeatureFlag(id: number): Promise<boolean>;
  getAllFeatureFlags(filters?: Partial<FeatureFlag>): Promise<FeatureFlag[]>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAllAuditLogs(filters?: Partial<AuditLog>): Promise<AuditLog[]>;
  
  // Compliance report operations
  getComplianceReport(id: number): Promise<ComplianceReport | undefined>;
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
  updateComplianceReport(id: number, report: Partial<InsertComplianceReport>): Promise<ComplianceReport | undefined>;
  getAllComplianceReports(filters?: Partial<ComplianceReport>): Promise<ComplianceReport[]>;
  
  // System metrics operations
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getAllSystemMetrics(filters?: Partial<SystemMetric>): Promise<SystemMetric[]>;
  
  // Market operations
  getProduceMarket(id: number): Promise<ProduceMarket | undefined>;
  createProduceMarket(produceMarket: InsertProduceMarket): Promise<ProduceMarket>;
  updateProduceMarket(id: number, produceMarket: Partial<InsertProduceMarket>): Promise<ProduceMarket | undefined>;
  deleteProduceMarket(id: number): Promise<boolean>;
  getAllProduceMarkets(filters?: Partial<ProduceMarket>): Promise<ProduceMarket[]>;

  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private featureFlags: Map<number, FeatureFlag>;
  private auditLogs: Map<number, AuditLog>;
  private complianceReports: Map<number, ComplianceReport>;
  private systemMetrics: Map<number, SystemMetric>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private contentIdCounter: number;
  private featureFlagIdCounter: number;
  private auditLogIdCounter: number;
  private complianceReportIdCounter: number;
  private systemMetricIdCounter: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.featureFlags = new Map();
    this.auditLogs = new Map();
    this.complianceReports = new Map();
    this.systemMetrics = new Map();
    
    this.userIdCounter = 1;
    this.contentIdCounter = 1;
    this.featureFlagIdCounter = 1;
    this.auditLogIdCounter = 1;
    this.complianceReportIdCounter = 1;
    this.systemMetricIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  // Helper method to filter array based on partial object
  private filterItems<T>(items: T[], filters?: Partial<T>): T[] {
    if (!filters) return [...items];
    
    return items.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = (filters as any)[key];
        const itemValue = (item as any)[key];
        
        if (filterValue === undefined) return true;
        
        // Handle array case
        if (Array.isArray(filterValue) && Array.isArray(itemValue)) {
          return filterValue.some(v => itemValue.includes(v));
        }
        
        return itemValue === filterValue;
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, lastActive: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async getAllUsers(filters?: Partial<User>): Promise<User[]> {
    return this.filterItems(Array.from(this.users.values()), filters);
  }
  
  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.contentIdCounter++;
    const now = new Date();
    const content: Content = { ...insertContent, id, createdAt: now };
    this.contents.set(id, content);
    return content;
  }
  
  async updateContent(id: number, contentData: Partial<InsertContent>): Promise<Content | undefined> {
    const content = await this.getContent(id);
    if (!content) return undefined;
    
    const updatedContent: Content = { ...content, ...contentData };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }
  
  async getAllContent(filters?: Partial<Content>): Promise<Content[]> {
    return this.filterItems(Array.from(this.contents.values()), filters);
  }
  
  // Feature flag methods
  async getFeatureFlag(id: number): Promise<FeatureFlag | undefined> {
    return this.featureFlags.get(id);
  }
  
  async getFeatureFlagByName(name: string): Promise<FeatureFlag | undefined> {
    return Array.from(this.featureFlags.values()).find(
      (flag) => flag.name === name,
    );
  }
  
  async createFeatureFlag(insertFlag: InsertFeatureFlag): Promise<FeatureFlag> {
    const id = this.featureFlagIdCounter++;
    const now = new Date();
    const flag: FeatureFlag = { ...insertFlag, id, lastUpdated: now };
    this.featureFlags.set(id, flag);
    return flag;
  }
  
  async updateFeatureFlag(id: number, flagData: Partial<InsertFeatureFlag>): Promise<FeatureFlag | undefined> {
    const flag = await this.getFeatureFlag(id);
    if (!flag) return undefined;
    
    const now = new Date();
    const updatedFlag: FeatureFlag = { ...flag, ...flagData, lastUpdated: now };
    this.featureFlags.set(id, updatedFlag);
    return updatedFlag;
  }
  
  async deleteFeatureFlag(id: number): Promise<boolean> {
    return this.featureFlags.delete(id);
  }
  
  async getAllFeatureFlags(filters?: Partial<FeatureFlag>): Promise<FeatureFlag[]> {
    return this.filterItems(Array.from(this.featureFlags.values()), filters);
  }
  
  // Audit log methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogIdCounter++;
    const now = new Date();
    const log: AuditLog = { ...insertLog, id, timestamp: now };
    this.auditLogs.set(id, log);
    return log;
  }
  
  async getAllAuditLogs(filters?: Partial<AuditLog>): Promise<AuditLog[]> {
    return this.filterItems(Array.from(this.auditLogs.values()), filters);
  }
  
  // Compliance report methods
  async getComplianceReport(id: number): Promise<ComplianceReport | undefined> {
    return this.complianceReports.get(id);
  }
  
  async createComplianceReport(insertReport: InsertComplianceReport): Promise<ComplianceReport> {
    const id = this.complianceReportIdCounter++;
    const now = new Date();
    const report: ComplianceReport = { ...insertReport, id, lastGenerated: now };
    this.complianceReports.set(id, report);
    return report;
  }
  
  async updateComplianceReport(id: number, reportData: Partial<InsertComplianceReport>): Promise<ComplianceReport | undefined> {
    const report = await this.getComplianceReport(id);
    if (!report) return undefined;
    
    const updatedReport: ComplianceReport = { ...report, ...reportData };
    this.complianceReports.set(id, updatedReport);
    return updatedReport;
  }
  
  async getAllComplianceReports(filters?: Partial<ComplianceReport>): Promise<ComplianceReport[]> {
    return this.filterItems(Array.from(this.complianceReports.values()), filters);
  }
  
  // System metrics methods
  async createSystemMetric(insertMetric: InsertSystemMetric): Promise<SystemMetric> {
    const id = this.systemMetricIdCounter++;
    const now = new Date();
    const metric: SystemMetric = { ...insertMetric, id, timestamp: now };
    this.systemMetrics.set(id, metric);
    return metric;
  }
  
  async getAllSystemMetrics(filters?: Partial<SystemMetric>): Promise<SystemMetric[]> {
    return this.filterItems(Array.from(this.systemMetrics.values()), filters);
  }
  
  // Initialize with sample data for testing
  private async initializeData() {
    // Create admin user
    await this.createUser({
      username: "superadmin",
      password: "$2b$10$o8.QDQrvbDS7Wv8xVMqriOVCcbwMawqGg0gZ3n.JHPyFzgkx9RDIO", // "password"
      email: "admin@agrihero6.com",
      fullName: "Alex Johnson",
      role: "super_admin",
      region: "global",
      status: "active"
    });
    
    // Create initial feature flags
    await this.createFeatureFlag({
      name: "Marketplace Enabled",
      description: "Allow users to buy and sell agricultural products",
      enabled: true,
      scope: "global",
      regions: [],
      updatedBy: 1
    });
    
    await this.createFeatureFlag({
      name: "IoT Device Sync",
      description: "Sync data from farm IoT devices to the platform",
      enabled: true,
      scope: "global",
      regions: [],
      updatedBy: 1
    });
    
    await this.createFeatureFlag({
      name: "Agricultural Chat",
      description: "In-app messaging between farmers and agronomists",
      enabled: false,
      scope: "region",
      regions: ["Kenya"],
      updatedBy: 1
    });
    
    await this.createFeatureFlag({
      name: "Beta: Crop Prediction",
      description: "AI-powered crop yield prediction tools",
      enabled: true,
      scope: "beta",
      regions: [],
      updatedBy: 1
    });
    
    // Create initial compliance reports
    await this.createComplianceReport({
      title: "Crop Yield Report",
      description: "Regional crop yield statistics for regulatory reporting",
      type: "crop_yield",
      frequency: "weekly",
      status: "generated",
      pendingActions: 0,
      region: "global"
    });
    
    await this.createComplianceReport({
      title: "Fertilizer Usage",
      description: "Fertilizer application statistics across regions",
      type: "fertilizer_usage",
      frequency: "monthly",
      status: "generated",
      pendingActions: 0,
      region: "global"
    });
    
    await this.createComplianceReport({
      title: "GDPR Compliance",
      description: "Data privacy compliance status and pending actions",
      type: "gdpr",
      frequency: "weekly",
      status: "pending_action",
      pendingActions: 3,
      region: "Europe"
    });
    
    // Create initial system metrics
    await this.createSystemMetric({
      name: "Active Users",
      value: "12493",
      type: "users"
    });
    
    await this.createSystemMetric({
      name: "Content Items",
      value: "3721",
      type: "content"
    });
    
    await this.createSystemMetric({
      name: "Moderation Queue",
      value: "28",
      type: "moderation"
    });
    
    await this.createSystemMetric({
      name: "System Health",
      value: "97.3",
      type: "health"
    });
  }
}

export const storage = new MemStorage();
