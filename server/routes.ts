import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend Session Data
declare module "express-session" {
  interface SessionData {
    adminId?: number;
    memberId?: number;
  }
}

// Middleware to check Admin Auth
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check Member Auth
const requireMember = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.memberId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session Setup
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { maxAge: 86400000 }
  }));

  // === ADMIN AUTH ===
  app.post(api.admin.login.path, async (req, res) => {
    try {
      const { email, password } = api.admin.login.input.parse(req.body);
      const admin = await storage.getAdminByEmail(email);
      
      // Simple password check (In production, use bcrypt)
      // For this MVP/Lite, we'll store plain text or simple hash if desired, 
      // but let's assume seeded admin uses "admin123"
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.adminId = admin.id;
      res.json({ token: "session", admin });
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.post(api.admin.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.admin.me.path, async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ message: "Not logged in" });
    const admin = await storage.getAdmin(req.session.adminId);
    if (!admin) return res.status(401).json({ message: "Admin not found" });
    res.json(admin);
  });

  // === MEMBER AUTH (OTP) ===
  app.post(api.auth.requestOtp.path, async (req, res) => {
    try {
      const { icNumber, email } = api.auth.requestOtp.input.parse(req.body);
      
      // Check if member matches IC and Email
      // NOTE: User requirement says "Members can register anytime by entering their IC and email". 
      // If pre-registered, we update details. If new, we create?
      // "Pre-register members by IC number and email" -> Admin does this.
      // "Members can register anytime..." -> This implies Self-Registration.
      // Logic:
      // 1. Check if member exists by IC.
      // 2. If exists, check email match. 
      // 3. If not exists, maybe create new if "Open Registration" is allowed? 
      //    Or strictly must be pre-registered? 
      //    "Pre-register members... Members can register anytime..." -> Ambiguous.
      //    Let's assume Self-Registration is allowed if they don't exist.
      //    OR strict mode: Must match Pre-Reg?
      //    "Members can register anytime by entering their IC and email" sounds like creating a NEW record if needed.
      //    However, usually systems like this require valid IC.
      //    Let's assume: If exists, verify. If not, Create NEW entry (Register).
      
      let member = await storage.getMemberByIc(icNumber);
      if (member) {
        if (member.email.toLowerCase() !== email.toLowerCase()) {
           // Update email if it was pre-registered with a different one? 
           // Or reject? Let's reject for security if emails don't match pre-reg data.
           // But prompt says "Members can register... by entering their IC and email".
           // Let's assume we use the input email for OTP.
           // If they verify OTP, we link this email to the IC?
           // Safe bet: Send OTP to the PROVIDED email.
        }
      } 
      
      // Generate OTP (Hardcoded to 123654 for testing)
      const code = "123654";
      await storage.createOtp(email, code);
      
      console.log(`[OTP] Sent to ${email}: ${code}`); // MOCK EMAIL SENDING - HARDCODED FOR TESTING
      
      res.json({ message: "OTP Sent", email });
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.verifyOtp.path, async (req, res) => {
    try {
      const { email, code, icNumber } = api.auth.verifyOtp.input.parse(req.body);
      const isValid = await storage.verifyOtp(email, code);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // OTP Verified. Handle Member Record.
      let member = await storage.getMemberByIc(icNumber);
      if (!member) {
        // Create new member
        member = await storage.createMember({
          icNumber,
          email,
          isRegistered: true,
          isPreRegistered: false,
        });
      } else {
        // Update existing
        if (!member.isRegistered) {
          member = await storage.updateMember(member.id, { isRegistered: true, email }); // Update email to the verified one
        }
      }
      
      req.session.memberId = member.id;
      res.json({ token: "session", member });
    } catch (err) {
      res.status(400).json({ message: "Verification failed" });
    }
  });

  // === MEMBER MANAGEMENT (ADMIN) ===
  app.get(api.members.list.path, requireAdmin, async (req, res) => {
    const { page, limit, search, classId } = req.query;
    const result = await storage.getMembers({ 
      page: Number(page) || 1, 
      limit: Number(limit) || 10,
      search: search as string,
      classId: classId ? Number(classId) : undefined
    });
    res.json(result);
  });

  app.post(api.members.preRegister.path, requireAdmin, async (req, res) => {
    try {
      const input = api.members.preRegister.input.parse(req.body);
      const existing = await storage.getMemberByIc(input.icNumber);
      if (existing) return res.status(400).json({ message: "IC already exists" });
      
      const member = await storage.createMember({
        ...input,
        isPreRegistered: true,
        isRegistered: false
      });
      
      await storage.createAuditLog({
        adminId: req.session.adminId!,
        action: "PRE_REGISTER",
        targetType: "MEMBER",
        targetId: member.id,
        details: { ic: input.icNumber }
      });
      
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ message: "Error creating member" });
    }
  });
  
  app.get(api.members.get.path, requireAdmin, async (req, res) => {
    const member = await storage.getMember(Number(req.params.id));
    if (!member) return res.status(404).json({ message: "Not found" });
    const classes = await storage.getMemberClasses(member.id);
    res.json({ ...member, classes });
  });
  
  app.put(api.members.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.members.update.input.parse(req.body);
      const member = await storage.updateMember(Number(req.params.id), input);
      
      await storage.createAuditLog({
        adminId: req.session.adminId!,
        action: "UPDATE_MEMBER",
        targetType: "MEMBER",
        targetId: member.id
      });
      
      res.json(member);
    } catch (err) {
      res.status(400).json({ message: "Error updating" });
    }
  });
  
  app.delete(api.members.delete.path, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteMember(id);
    await storage.createAuditLog({
      adminId: req.session.adminId!,
      action: "DELETE_MEMBER",
      targetType: "MEMBER",
      targetId: id
    });
    res.json({ message: "Deleted" });
  });

  app.get(api.members.export.path, requireAdmin, async (req, res) => {
    const members = await storage.getAllMembersForExport();
    // Convert to CSV
    const csv = members.map(m => `${m.icNumber},${m.fullName},${m.email}`).join("\n");
    res.header('Content-Type', 'text/csv'); 
    res.attachment('members.csv');
    res.send(`IC,Name,Email\n${csv}`);
  });

  // === MEMBER SELF-SERVICE ===
  app.get(api.memberMe.get.path, requireMember, async (req, res) => {
    const member = await storage.getMember(req.session.memberId!);
    if (!member) return res.status(401).json({ message: "Not found" });
    const classes = await storage.getMemberClasses(member.id);
    res.json({ ...member, classes });
  });

  app.put(api.memberMe.update.path, requireMember, async (req, res) => {
    try {
      const input = api.memberMe.update.input.parse(req.body);
      const member = await storage.updateMember(req.session.memberId!, input);
      res.json(member);
    } catch (err) {
      res.status(400).json({ message: "Error updating" });
    }
  });

  // === LOOKUPS ===
  // Classes
  app.get(api.lookups.classes.list.path, requireAdmin, async (req, res) => {
    const data = await storage.getClasses();
    res.json(data);
  });
  app.post(api.lookups.classes.create.path, requireAdmin, async (req, res) => {
    const data = await storage.createClass(req.body);
    res.status(201).json(data);
  });
  app.delete(api.lookups.classes.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.json({ message: "Deleted" });
  });
  
  // Supervisors
  app.get(api.lookups.supervisors.list.path, requireAdmin, async (req, res) => {
    const data = await storage.getSupervisors();
    res.json(data);
  });
  app.post(api.lookups.supervisors.create.path, requireAdmin, async (req, res) => {
    const data = await storage.createSupervisor(req.body);
    res.status(201).json(data);
  });
  app.delete(api.lookups.supervisors.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteSupervisor(Number(req.params.id));
    res.json({ message: "Deleted" });
  });
  
  // Ranks
  app.get(api.lookups.ranks.list.path, requireAdmin, async (req, res) => {
    const data = await storage.getRanks();
    res.json(data);
  });
  app.post(api.lookups.ranks.create.path, requireAdmin, async (req, res) => {
    const data = await storage.createRank(req.body);
    res.status(201).json(data);
  });
  app.delete(api.lookups.ranks.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteRank(Number(req.params.id));
    res.json({ message: "Deleted" });
  });
  
  // Audit
  app.get(api.audit.list.path, requireAdmin, async (req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });
  
  // SEED DATA
  // Check if admin exists, if not create default
  const existingAdmin = await storage.getAdminByEmail("admin@cis.com");
  if (!existingAdmin) {
    await storage.createAdmin({
      email: "admin@cis.com",
      password: "admin",
      name: "System Admin"
    });
    console.log("Seeded Admin: admin@cis.com / admin");
  }

  return httpServer;
}
