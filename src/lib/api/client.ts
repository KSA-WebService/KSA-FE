import type { ApiEnvelope } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Base for the two error kinds that carry an HTTP status. Callers should
// branch on `status` for authorization decisions (401/403) -- it's reliable
// across every endpoint, unlike `errorCode`, which is backend-specific and
// only present when the response body was well-formed.
export abstract class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// A well-formed { resultType: "fail", error: {...} } response
// (docs/admin/api-contract.md).
export class ApiError extends ApiRequestError {
  readonly errorCode: string;
  readonly data?: Record<string, unknown> | null;

  constructor(status: number, errorCode: string, reason: string, data?: Record<string, unknown> | null) {
    super(reason, status);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.data = data;
  }
}

// A response was received, but its body wasn't valid JSON or didn't match
// the { resultType, error, success } envelope (e.g. a bare 401/403 from a
// proxy or an unrelated guard). `status` is still trustworthy; there's no
// errorCode/reason to surface.
export class ApiResponseFormatError extends ApiRequestError {
  constructor(status: number, message = "Backend response did not match the expected format.") {
    super(message, status);
    this.name = "ApiResponseFormatError";
  }
}

// fetch() itself failed -- no response was ever received (offline, DNS,
// CORS, timeout, etc). There is no HTTP status to reason about here, and
// this must never be interpreted as an authorization rejection.
export class ApiTransportError extends Error {
  constructor(message = "Failed to reach the KSA backend.", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ApiTransportError";
  }
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  if (typeof value !== "object" || value === null || !("resultType" in value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (record.resultType === "success") {
    return "success" in record;
  }

  if (record.resultType === "fail") {
    const error = record.error as Record<string, unknown> | null;
    return (
      typeof error === "object" &&
      error !== null &&
      typeof error.errorCode === "string" &&
      typeof error.reason === "string"
    );
  }

  return false;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  accessToken?: string;
  body?: unknown;
}

// Shared fetch wrapper for the NestJS KSA backend. Attaches the Supabase
// access token as a Bearer header and unwraps the confirmed
// { resultType, error, success } response envelope (docs/admin/api-contract.md).
// Supabase itself is Auth-only in this app -- all application data, including
// this call, goes through the NestJS API, never supabase.from(...).
//
// Throws one of three distinct error types so callers can react correctly:
// ApiTransportError (no response at all), ApiResponseFormatError (a
// response came back but wasn't the expected shape), or ApiError (a
// well-formed backend failure). A network failure or malformed response
// must never be mistaken for an authorization rejection.
export async function apiFetch<T>(
  path: string,
  { accessToken, body, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiTransportError("Failed to reach the KSA backend.", { cause });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiResponseFormatError(response.status, "Backend response was not valid JSON.");
  }

  if (!isApiEnvelope(payload)) {
    throw new ApiResponseFormatError(response.status);
  }

  if (payload.resultType === "fail") {
    throw new ApiError(response.status, payload.error.errorCode, payload.error.reason, payload.error.data);
  }

  return payload.success as T;
}
