export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public severity: "error" | "warning" = "error",
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  if (typeof error === "string") {
    return new AppError(error);
  }

  return new AppError(fallbackMessage);
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    ("NetworkError" === error.name ||
      error.message.includes("network") ||
      error.message.includes("Network"))
  );
}

export function logError(error: unknown, context?: string): void {
  const appError = handleError(error);

  console.error("Error:", {
    context,
    message: appError.message,
    code: appError.code,
    severity: appError.severity,
    metadata: appError.metadata,
    stack: appError.stack,
  });
}
