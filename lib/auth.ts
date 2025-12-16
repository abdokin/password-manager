import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { EmailAdapter } from "./auth-email-adapter";

// Get email server configuration for NextAuth
function getEmailServerConfig() {
  // Production: Use configured SMTP
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };
  }

  // Development: Use console logging transport
  // NextAuth requires a server config, so we provide a minimal one
  // Actual email sending is handled by our adapter/queue system
  if (process.env.NODE_ENV === "development") {
    return {
      host: "localhost",
      port: 587,
      secure: false,
      // No auth needed for console logging
      tls: {
        rejectUnauthorized: false,
      },
    };
  }

  // Fallback: minimal config
  return {
    host: "localhost",
    port: 587,
    secure: false,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: EmailAdapter(),
  providers: [
    EmailProvider({
      server: getEmailServerConfig(),
      from: process.env.SMTP_FROM || "noreply@passwordmanager.com",
      // We handle email sending via our queue system in the adapter
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Email is sent via the adapter's createVerificationToken
        // This is just a placeholder - actual sending happens in the adapter
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 Magic Link (dev):", url);
          console.log("📧 For:", identifier);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login", // Show login page after requesting magic link
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
