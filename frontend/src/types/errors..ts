export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INVALID_INPUT"
  | "SERVICE_ERROR"
  | "NETWORK_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}
