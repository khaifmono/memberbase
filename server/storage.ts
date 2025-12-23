import { db } from "./db";
import { 
  admins, members, classes, supervisors, ranks, memberClasses, otpCodes, auditLogs,
  type Admin, type Member, type Class, type Supervisor, type Rank, type OtpCode, type AuditLog,
  type InsertAdmin, type InsertMember, type InsertClass, type InsertSupervisor, type InsertRank
} from "@shared/schema";
import { eq, like, or, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Admin
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdmin(id: number): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Member
  getMember(id: number): Promise<Member | undefined>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  getMemberByIc(icNumber: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: number): Promise<void>;
  
  // Member Lists (Admin)
  getMembers(params: { page: number; limit: number; search?: string; classId?: number }): Promise<{ data: (Member & { classes: number[] })[]; total: number }>;
  getAllMembersForExport(): Promise<Member[]>;
  
  // Lookups
  getClasses(): Promise<Class[]>;
  createClass(data: InsertClass): Promise<Class>;
  deleteClass(id: number): Promise<void>;
  
  getSupervisors(): Promise<Supervisor[]>;
  createSupervisor(data: InsertSupervisor): Promise<Supervisor>;
  deleteSupervisor(id: number): Promise<void>;
  
  getRanks(): Promise<Rank[]>;
  createRank(data: InsertRank): Promise<Rank>;
  deleteRank(id: number): Promise<void>;
  
  // OTP
  createOtp(email: string, code: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<boolean>;
  
  // Member Classes
  updateMemberClasses(memberId: number, classIds: number[]): Promise<void>;
  getMemberClasses(memberId: number): Promise<number[]>;
  
  // Audit
  createAuditLog(log: { adminId: number; action: string; targetType: string; targetId: number; details?: any }): Promise<void>;
  getAuditLogs(): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Admin
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }
  
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }
  
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }
  
  // Member
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }
  
  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.email, email));
    return member;
  }
  
  async getMemberByIc(icNumber: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.icNumber, icNumber));
    return member;
  }
  
  async createMember(insertMember: InsertMember): Promise<Member> {
    const { classIds, ...data } = insertMember;
    const [member] = await db.insert(members).values(data).returning();
    if (classIds && classIds.length > 0) {
      await this.updateMemberClasses(member.id, classIds);
    }
    return member;
  }
  
  async updateMember(id: number, updates: Partial<InsertMember>): Promise<Member> {
    const { classIds, ...data } = updates;
    const [member] = await db.update(members).set({ ...data, updatedAt: new Date() }).where(eq(members.id, id)).returning();
    if (classIds) {
      await this.updateMemberClasses(id, classIds);
    }
    return member;
  }
  
  async deleteMember(id: number): Promise<void> {
    await db.delete(memberClasses).where(eq(memberClasses.memberId, id));
    await db.delete(members).where(eq(members.id, id));
  }
  
  // Member Lists
  async getMembers({ page, limit, search, classId }: { page: number; limit: number; search?: string; classId?: number }): Promise<{ data: (Member & { classes: number[] })[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let conditions = [];
    if (search) {
      conditions.push(or(
        like(members.fullName, `%${search}%`),
        like(members.icNumber, `%${search}%`),
        like(members.email, `%${search}%`)
      ));
    }
    
    // Note: Filtering by classId needs a join, doing simple list for now or subquery
    // For MVP/Lite, we'll fetch all and filter in memory if classId is present, OR do a proper join.
    // Let's do a proper join if classId is present
    
    let baseQuery = db.select().from(members);
    
    // Count query
    // const [countRes] = await db.select({ count: sql<number>`count(*)` }).from(members).where(and(...conditions));
    
    // Simplification for Lite mode: Just simple pagination on members table
    // If search exists
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [countRes] = await db.select({ count: sql<number>`count(*)` }).from(members).where(whereClause);
    
    const data = await db.select().from(members)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(members.createdAt));

    // Enrich with classes
    const enriched = await Promise.all(data.map(async (m) => {
      const classes = await this.getMemberClasses(m.id);
      return { ...m, classes };
    }));
    
    return { data: enriched, total: Number(countRes.count) };
  }
  
  async getAllMembersForExport(): Promise<Member[]> {
    return await db.select().from(members).orderBy(desc(members.createdAt));
  }
  
  // Lookups
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes).orderBy(classes.name);
  }
  
  async createClass(data: InsertClass): Promise<Class> {
    const [cls] = await db.insert(classes).values(data).returning();
    return cls;
  }
  
  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }
  
  async getSupervisors(): Promise<Supervisor[]> {
    return await db.select().from(supervisors).orderBy(supervisors.name);
  }
  
  async createSupervisor(data: InsertSupervisor): Promise<Supervisor> {
    const [sup] = await db.insert(supervisors).values(data).returning();
    return sup;
  }
  
  async deleteSupervisor(id: number): Promise<void> {
    await db.delete(supervisors).where(eq(supervisors.id, id));
  }
  
  async getRanks(): Promise<Rank[]> {
    return await db.select().from(ranks).orderBy(ranks.level);
  }
  
  async createRank(data: InsertRank): Promise<Rank> {
    const [rnk] = await db.insert(ranks).values(data).returning();
    return rnk;
  }
  
  async deleteRank(id: number): Promise<void> {
    await db.delete(ranks).where(eq(ranks.id, id));
  }
  
  // OTP
  async createOtp(email: string, code: string): Promise<void> {
    // Invalidate old OTPs
    // await db.delete(otpCodes).where(eq(otpCodes.email, email)); 
    // Actually better to keep logs or just overwrite? Let's just insert new.
    await db.insert(otpCodes).values({
      email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      used: false
    });
  }
  
  async verifyOtp(email: string, code: string): Promise<boolean> {
    const [otp] = await db.select().from(otpCodes)
      .where(and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        eq(otpCodes.used, false)
      ))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
      
    if (!otp) return false;
    if (new Date() > otp.expiresAt) return false;
    
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
    return true;
  }
  
  // Member Classes
  async updateMemberClasses(memberId: number, classIds: number[]): Promise<void> {
    await db.delete(memberClasses).where(eq(memberClasses.memberId, memberId));
    if (classIds.length > 0) {
      await db.insert(memberClasses).values(
        classIds.map(classId => ({ memberId, classId }))
      );
    }
  }
  
  async getMemberClasses(memberId: number): Promise<number[]> {
    const rows = await db.select().from(memberClasses).where(eq(memberClasses.memberId, memberId));
    return rows.map(r => r.classId);
  }
  
  // Audit
  async createAuditLog(log: { adminId: number; action: string; targetType: string; targetId: number; details?: any }): Promise<void> {
    await db.insert(auditLogs).values(log);
  }
  
  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  }
}

export const storage = new DatabaseStorage();
