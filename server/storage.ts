import { reports, users, updates, type User, type InsertUser, type Report, type InsertReport, type Update, type InsertUpdate } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq, and, desc } from "drizzle-orm";
import { db, pool } from "./db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const PostgresSessionStore = connectPg(session);

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
  sessionStore: any; // Express session store
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
    
    // Initialize with default users if needed
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    const scryptAsync = promisify(scrypt);
    
    async function hashPassword(password: string) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    }
    
    // Check if admin user exists
    const adminExists = await this.getUserByUsername("admin");
    if (!adminExists) {
      await this.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        name: "Admin User",
        email: "admin@report-it.com",
        role: "admin"
      });
    }
    
    // Check if regular user exists
    const userExists = await this.getUserByUsername("user");
    if (!userExists) {
      await this.createUser({
        username: "user",
        password: await hashPassword("user123"),
        name: "Regular User",
        email: "user@report-it.com",
        role: "user"
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    // Insert the report
    const result = await db.insert(reports).values({
      ...reportData,
      status: "pending",
      photos: []
    }).returning();
    
    const newReport = result[0];
    
    // Create initial update for report creation
    await this.createUpdate({
      reportId: newReport.id,
      userId: reportData.userId,
      content: "Report submitted"
    });
    
    // Update user activity and check for badges
    const { updateUserActivity } = await import('./badges');
    await updateUserActivity(reportData.userId, 'report');
    
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const result = await db.select().from(reports).where(eq(reports.id, id));
    return result[0];
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.userId, userId));
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports);
  }

  async updateReportStatus(id: number, status: string): Promise<Report | undefined> {
    const report = await this.getReport(id);
    if (!report) return undefined;
    
    const result = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    
    // If status changed to completed, update user activity and badges
    if (status === "completed" && report.status !== "completed") {
      const { updateUserActivity } = await import('./badges');
      await updateUserActivity(report.userId, 'completed');
    }
    
    return result[0];
  }

  async updateReportAssignment(id: number, assignedTo: string): Promise<Report | undefined> {
    const result = await db
      .update(reports)
      .set({ assignedTo })
      .where(eq(reports.id, id))
      .returning();
    
    return result[0];
  }

  async createUpdate(updateData: InsertUpdate): Promise<Update> {
    const result = await db.insert(updates).values(updateData).returning();
    
    // Update user activity and check for badges
    const { updateUserActivity } = await import('./badges');
    await updateUserActivity(updateData.userId, 'update');
    
    return result[0];
  }

  async getUpdatesByReportId(reportId: number): Promise<Update[]> {
    return db
      .select()
      .from(updates)
      .where(eq(updates.reportId, reportId))
      .orderBy(desc(updates.createdAt));
  }

  async addPhotoToReport(reportId: number, photoUrl: string): Promise<void> {
    // First, get the existing report
    const report = await this.getReport(reportId);
    if (!report) return;
    
    // Extract existing photos and add the new one
    const photos = Array.isArray(report.photos) ? [...report.photos, photoUrl] : [photoUrl];
    
    // Update the report with the new photos array
    await db
      .update(reports)
      .set({ photos })
      .where(eq(reports.id, reportId));
  }
}

export const storage = new DatabaseStorage();
