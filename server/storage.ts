import { reports, users, updates, type User, type InsertUser, type Report, type InsertReport, type Update, type InsertUpdate } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByUser(userId: number): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(id: number, status: string): Promise<Report | undefined>;
  updateReportAssignment(id: number, assignedTo: string): Promise<Report | undefined>;
  
  // Update operations
  createUpdate(update: InsertUpdate): Promise<Update>;
  getUpdatesByReportId(reportId: number): Promise<Update[]>;
  
  // Photo operations
  addPhotoToReport(reportId: number, photoUrl: string): Promise<void>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, Report>;
  private updates: Map<number, Update>;
  public sessionStore: session.SessionStore;
  private userIdCounter: number;
  private reportIdCounter: number;
  private updateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.updates = new Map();
    this.userIdCounter = 1;
    this.reportIdCounter = 1;
    this.updateIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours in milliseconds
    });
    
    // Add some sample users for easier testing
    this.createUser({
      username: "admin",
      password: "$2b$10$NRTbUBpMIH8qfyOI.fXjk.3ZP4SbNWVR.YM3EH0z0zwmqIp95wLvy", // "admin123"
      name: "Admin User",
      email: "admin@report-it.com",
      role: "admin"
    });
    
    this.createUser({
      username: "user",
      password: "$2b$10$YoFdA3E5NS.Zr5UNsWwbC.4B5iAxrWWXnQvQkLkvP50UbDLSy4Jxy", // "user123"
      name: "Regular User",
      email: "user@report-it.com",
      role: "user"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const id = this.reportIdCounter++;
    const now = new Date();
    const report: Report = { 
      ...reportData, 
      id, 
      status: "pending", 
      photos: [],
      assignedTo: undefined,
      createdAt: now 
    };
    this.reports.set(id, report);
    
    // Create initial update for report creation
    await this.createUpdate({
      reportId: id,
      userId: reportData.userId,
      content: "Report submitted"
    });
    
    return report;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const userReports: Report[] = [];
    for (const report of this.reports.values()) {
      if (report.userId === userId) {
        userReports.push(report);
      }
    }
    return userReports;
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    report.status = status;
    this.reports.set(id, report);
    return report;
  }

  async updateReportAssignment(id: number, assignedTo: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    report.assignedTo = assignedTo;
    this.reports.set(id, report);
    return report;
  }

  async createUpdate(updateData: InsertUpdate): Promise<Update> {
    const id = this.updateIdCounter++;
    const now = new Date();
    const update: Update = { ...updateData, id, createdAt: now };
    this.updates.set(id, update);
    return update;
  }

  async getUpdatesByReportId(reportId: number): Promise<Update[]> {
    const reportUpdates: Update[] = [];
    for (const update of this.updates.values()) {
      if (update.reportId === reportId) {
        reportUpdates.push(update);
      }
    }
    
    // Sort updates by creation date, most recent first
    return reportUpdates.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async addPhotoToReport(reportId: number, photoUrl: string): Promise<void> {
    const report = this.reports.get(reportId);
    if (!report) return;
    
    const photos = Array.isArray(report.photos) ? report.photos : [];
    photos.push(photoUrl);
    report.photos = photos;
    this.reports.set(reportId, report);
  }
}

export const storage = new MemStorage();
