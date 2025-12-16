import { render } from "@react-email/render";
import nodemailer from "nodemailer";

import { TwoFactorEmail } from "./email/templates/2fa-code";
import { MagicLinkEmail } from "./email/templates/magic-link";
import { WelcomeEmail } from "./email/templates/welcome";

// Create transporter (configure based on your email provider)
// For development, use Ethereal Email or console logging
function createTransporter() {
  // Production: Use configured SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Development: Use Ethereal Email (test service) or console logging
  if (process.env.NODE_ENV === "development") {
    // Try Ethereal Email first (requires account setup)
    if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASSWORD) {
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASSWORD,
        },
      });
    }

    // Fallback: Console logging (emails printed to console)
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  // Fallback for other environments
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

const transporter = createTransporter();

export async function sendMagicLink(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`;

  // Render JSX email template to HTML
  const html = await render(MagicLinkEmail({ email, magicLink: url }));
  const text = `Sign in to Password Manager\n\nClick this link to sign in: ${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`;

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@passwordmanager.com",
    to: email,
    subject: "Sign in to Password Manager",
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
      console.log("Magic link email (dev mode):", url);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "Check console");
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function send2FACode(email: string, code: string) {
  // In development without SMTP, log the 2FA code directly
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n🔐 ===== 2FA CODE (DEV MODE) =====");
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log("===================================\n");
    return { success: true, messageId: "dev-mode" };
  }

  // Render JSX email template to HTML
  const html = await render(TwoFactorEmail({ email, code }));
  const text = `Your 2FA verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please secure your account immediately.`;

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@passwordmanager.com",
    to: email,
    subject: "Your 2FA Verification Code",
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
      console.log("2FA code (dev mode):", code);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "Check console");
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending 2FA email:", error);
    // In development, don't fail - just log
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️  2FA email sending failed, but continuing in dev mode");
      return { success: true, messageId: "dev-fallback" };
    }
    throw error;
  }
}

export async function sendWelcomeEmail(email: string) {
  // In development without SMTP, just log
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n🎉 ===== WELCOME EMAIL (DEV MODE) =====");
    console.log(`To: ${email}`);
    console.log("======================================\n");
    return { success: true, messageId: "dev-mode" };
  }

  // Render JSX email template to HTML
  const html = await render(WelcomeEmail({ email }));
  const text = `Welcome to Password Manager!\n\nThank you for signing up. Your account has been created successfully.\n\nWe recommend setting up two-factor authentication (2FA) to enhance your account security.`;

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@passwordmanager.com",
    to: email,
    subject: "Welcome to Password Manager!",
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
      console.log("Welcome email sent (dev mode)");
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "Check console");
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // In development, don't fail - just log
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️  Welcome email sending failed, but continuing in dev mode");
      return { success: true, messageId: "dev-fallback" };
    }
    throw error;
  }
}
