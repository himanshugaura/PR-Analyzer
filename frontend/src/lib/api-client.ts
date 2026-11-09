const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

let customToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  customToken = token;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, token, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Resolve Clerk session token
  let bearerToken = token || customToken;
  if (!bearerToken && typeof window !== "undefined" && window.Clerk?.session) {
    try {
      bearerToken = await window.Clerk.session.getToken();
    } catch {
      // Session token retrieval skipped or unauthenticated
    }
  }

  if (bearerToken) {
    defaultHeaders["Authorization"] = `Bearer ${bearerToken}`;
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...((headers as Record<string, string>) || {}),
    },
    ...restOptions,
  });

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message =
      (json as { message?: string })?.message ||
      `HTTP error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, json);
  }

  // Handle standard ApiResponse envelope { success: true, data: T } or direct return
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }

  return json as T;
}
