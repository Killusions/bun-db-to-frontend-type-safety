import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { customSession } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db, tables } from '../db';
import { user, session, account, verification } from '../db/auth-schema';

const getUserRoles = async (userId: string) => {
  try {
    const rolesResult = await db.query.userRole.findMany({
      where: eq(tables.userRole.userId, userId),
      with: {
        role: {
          columns: { name: true },
        },
      },
    });
    return rolesResult.map((ur) => ur.role.name);
  } catch (error: unknown) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset link for ${user.email}: ${url}`);
      // TODO: Implement email sending service (e.g., Resend, SendGrid)
    }
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`Email verification link for ${user.email}: ${url}`);
      // TODO: Implement email sending service
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID ? {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        enabled: !!process.env.GITHUB_CLIENT_ID,
      }
    } : {}),
    ...(process.env.GOOGLE_CLIENT_ID ? {google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    }
    } : {})
  },

  trustedOrigins: [
    'http://localhost:3000',
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    ...(process.env.NODE_ENV === 'production' && process.env.PRODUCTION_URL ? [process.env.PRODUCTION_URL] : []),
  ],

  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-here',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  basePath: '/auth',

  advanced: {
    database: {
      generateId: () => crypto.randomUUID()
    },
    crossSubdomainCookies: {
      enabled: false,
      domain: process.env.COOKIE_DOMAIN,
    }
  },

  rateLimit: {
    window: 60, // 1 minute
    max: 100, // requests per window
  },

  plugins: [
    customSession(async ({ user, session }) => {
      const roles = await getUserRoles(user.id);
      return {
        roles: roles && roles.length > 0 ? roles : ['user'],
        user,
        session
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session['user'];
