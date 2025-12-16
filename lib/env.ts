import { z } from "zod";

// Environment variable validation schema
const envSchema = z.object({
  // NextAuth
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // Encryption
  MASTER_ENCRYPTION_KEY: z.string().min(32, "MASTER_ENCRYPTION_KEY must be at least 32 characters"),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join("\n")}\n\n` +
          `Please check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;
