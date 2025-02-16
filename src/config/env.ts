import { z } from "zod";

const envSchema = z.object({
  // API Configuration
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
