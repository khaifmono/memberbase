import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === ADMINS ===
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === MEMBERS ===
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  icNumber: text("ic_number").notNull().unique(), // Plain text but masked in UI
  email: text("email").notNull().unique(),
  
  // Registration Status
  isPreRegistered: boolean("is_pre_registered").default(false),
  isRegistered: boolean("is_registered").default(false),
  
  // Personal Info
  fullName: text("full_name"),
  nickname: text("nickname"),
  gender: text("gender"),
  dob: text("dob"), // Store as string for flexibility or date
  phone: text("phone"),
  address: text("address"),
  postcode: text("postcode"),
  city: text("city"),
  state: text("state"),
  
  // Job Info
  occupation: text("occupation"),
  employerName: text("employer_name"),
  employerAddress: text("employer_address"),
  
  // Next of Kin
  kinName: text("kin_name"),
  kinRelation: text("kin_relation"),
  kinPhone: text("kin_phone"),
  
  // Silat Experience
  hasSilatExperience: boolean("has_silat_experience").default(false),
  silatExperienceDetails: text("silat_experience_details"),
  completedCekak: boolean("completed_cekak").default(false),
  
  // PDPA
  pdpaConsentAt: timestamp("pdpa_consent_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === LOOKUPS (Manageable Dropdowns) ===
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Kelas A", "Kelas B"
  location: text("location"),
  isActive: boolean("is_active").default(true),
});

export const supervisors = pgTable("supervisors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
});

export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Peringkat 1"
  level: integer("level"), // For sorting
  isActive: boolean("is_active").default(true),
});

// === RELATIONS (Many-to-Many for Member Classes) ===
export const memberClasses = pgTable("member_classes", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id),
  classId: integer("class_id").notNull().references(() => classes.id),
});

// === OTP CODES ===
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AUDIT LOGS ===
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => admins.id),
  action: text("action").notNull(), // "UPDATE_MEMBER", "DELETE_MEMBER"
  targetType: text("target_type").notNull(), // "MEMBER", "CLASS"
  targetId: integer("target_id").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const membersRelations = relations(members, ({ many }) => ({
  classes: many(memberClasses),
}));

export const memberClassesRelations = relations(memberClasses, ({ one }) => ({
  member: one(members, {
    fields: [memberClasses.memberId],
    references: [members.id],
  }),
  class: one(classes, {
    fields: [memberClasses.classId],
    references: [classes.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true, createdAt: true });
export const insertMemberSchema = createInsertSchema(members).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  classIds: z.array(z.number()).optional(), // For form submission
});

export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export const insertSupervisorSchema = createInsertSchema(supervisors).omit({ id: true });
export const insertRankSchema = createInsertSchema(ranks).omit({ id: true });

// === TYPES ===
export type Admin = typeof admins.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Supervisor = typeof supervisors.$inferSelect;
export type Rank = typeof ranks.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
