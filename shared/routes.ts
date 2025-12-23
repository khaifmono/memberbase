import { z } from 'zod';
import { 
  insertAdminSchema, 
  insertMemberSchema, 
  insertClassSchema, 
  insertSupervisorSchema, 
  insertRankSchema,
  admins,
  members,
  classes,
  supervisors,
  ranks,
  auditLogs
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === AUTH ===
  admin: {
    login: {
      method: 'POST' as const,
      path: '/api/admin/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ 
          token: z.string(), // Or just session cookie confirmation
          admin: z.custom<typeof admins.$inferSelect>() 
        }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/admin/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/admin/me',
      responses: {
        200: z.custom<typeof admins.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === MEMBER AUTH (OTP) ===
  auth: {
    requestOtp: {
      method: 'POST' as const,
      path: '/api/auth/otp/request',
      input: z.object({
        icNumber: z.string(),
        email: z.string().email(),
      }),
      responses: {
        200: z.object({ message: z.string(), email: z.string() }),
        400: errorSchemas.validation,
      },
    },
    verifyOtp: {
      method: 'POST' as const,
      path: '/api/auth/otp/verify',
      input: z.object({
        email: z.string().email(),
        code: z.string(),
        icNumber: z.string(),
      }),
      responses: {
        200: z.object({ 
          token: z.string(),
          member: z.custom<typeof members.$inferSelect>()
        }),
        400: errorSchemas.validation,
      },
    },
  },

  // === MEMBER MANAGEMENT (ADMIN) ===
  members: {
    list: {
      method: 'GET' as const,
      path: '/api/members',
      input: z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
        search: z.string().optional(),
        classId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          data: z.array(z.custom<typeof members.$inferSelect & { classes: number[] }>()), // Include class IDs
          total: z.number(),
          page: z.number(),
          totalPages: z.number(),
        }),
      },
    },
    preRegister: {
      method: 'POST' as const,
      path: '/api/members/pre-register',
      input: z.object({
        icNumber: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof members.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/members/:id',
      responses: {
        200: z.custom<typeof members.$inferSelect & { classes: number[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/members/:id',
      input: insertMemberSchema.partial(),
      responses: {
        200: z.custom<typeof members.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/members/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/members/export',
      responses: {
        200: z.any(), // CSV Download
      },
    },
  },

  // === MEMBER SELF-SERVICE ===
  memberMe: {
    get: {
      method: 'GET' as const,
      path: '/api/member/me',
      responses: {
        200: z.custom<typeof members.$inferSelect & { classes: number[] }>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/member/me',
      input: insertMemberSchema,
      responses: {
        200: z.custom<typeof members.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === LOOKUPS (ADMIN) ===
  lookups: {
    classes: {
      list: {
        method: 'GET' as const,
        path: '/api/lookups/classes',
        responses: { 200: z.array(z.custom<typeof classes.$inferSelect>()) },
      },
      create: {
        method: 'POST' as const,
        path: '/api/lookups/classes',
        input: insertClassSchema,
        responses: { 201: z.custom<typeof classes.$inferSelect>() },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/lookups/classes/:id',
        responses: { 200: z.object({ message: z.string() }) },
      },
    },
    supervisors: {
      list: {
        method: 'GET' as const,
        path: '/api/lookups/supervisors',
        responses: { 200: z.array(z.custom<typeof supervisors.$inferSelect>()) },
      },
      create: {
        method: 'POST' as const,
        path: '/api/lookups/supervisors',
        input: insertSupervisorSchema,
        responses: { 201: z.custom<typeof supervisors.$inferSelect>() },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/lookups/supervisors/:id',
        responses: { 200: z.object({ message: z.string() }) },
      },
    },
    ranks: {
      list: {
        method: 'GET' as const,
        path: '/api/lookups/ranks',
        responses: { 200: z.array(z.custom<typeof ranks.$inferSelect>()) },
      },
      create: {
        method: 'POST' as const,
        path: '/api/lookups/ranks',
        input: insertRankSchema,
        responses: { 201: z.custom<typeof ranks.$inferSelect>() },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/lookups/ranks/:id',
        responses: { 200: z.object({ message: z.string() }) },
      },
    },
  },
  
  // === AUDIT LOGS ===
  audit: {
    list: {
      method: 'GET' as const,
      path: '/api/audit-logs',
      responses: {
        200: z.array(z.custom<typeof auditLogs.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
