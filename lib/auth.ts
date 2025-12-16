import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { EmailAdapter } from "./auth-email-adapter";

export const authOptions: NextAuthOptions = {
  adapter: EmailAdapter(),
  providers: [
    EmailProvider({
      server: process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          }
        : undefined,
      from: process.env.SMTP_FROM || "noreply@passwordmanager.com",
      // We handle email sending via our queue system in the adapter
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Email is sent via the adapter's createVerificationToken
        // This is just a placeholder - actual sending happens in the adapter
        console.log("Verification request:", { identifier, url });
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
