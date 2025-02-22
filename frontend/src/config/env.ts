import { z } from "zod";

const envSchema = z.object({
  // API Configuration
  VITE_API_URL: z.string().min(1),
  VITE_GEMINI_API_KEY: z.string().min(1),
});

function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join("."));
      throw new Error(
        `Invalid environment variables: ${missingVars.join(
          ", "
        )}. Please check your .env file.`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Type assertion to ensure all env variables are validated
type EnvType = z.infer<typeof envSchema>;
declare global {
  interface ImportMetaEnv extends EnvType {}
}

export const config = {
  apiUrl: env.VITE_API_URL,
  geminiApiKey: env.VITE_GEMINI_API_KEY,
} as const;

// Validate required environment variables
if (!config.apiUrl) {
  throw new Error("VITE_API_URL is required");
}
