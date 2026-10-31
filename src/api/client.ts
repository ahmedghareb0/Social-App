const API_BASE_URL = "https://route-posts.routemisr.com";
export const TOKEN_STORAGE_KEY = "route-posts-token";

export interface ApiResponse<T, Meta = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
  meta?: Meta;
}

interface ApiErrorBody {
  message?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const status = `HTTP ${error.status}`;
    if (typeof error.details === "string" && error.details.trim()) {
      return `${error.message} (${status}) ${error.details}`;
    }
    if (error.details !== undefined) {
      return `${error.message} (${status}) ${JSON.stringify(error.details)}`;
    }
    return `${error.message} (${status})`;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export async function request<T, Meta = Record<string, unknown>>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T, Meta>> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  const responseText = await response.text();
  let payload: ApiResponse<T, Meta> | ApiErrorBody | undefined;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as ApiResponse<T, Meta> | ApiErrorBody;
    } catch {
      if (response.ok) {
        throw new ApiError("The server returned an invalid response.", response.status);
      }
      payload = { message: responseText };
    }
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody | undefined;
    throw new ApiError(
      errorBody?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload,
    );
  }

  if (!payload || !("success" in payload) || !payload.success) {
    const message = payload && "message" in payload && payload.message
      ? payload.message
      : "The server returned an invalid response.";
    throw new ApiError(
      message,
      response.status,
      payload,
    );
  }

  return payload as ApiResponse<T, Meta>;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
