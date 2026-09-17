const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return "/api/auth";
  // Remove trailing slash if provided in env var
  const trimmed = envUrl.replace(/\/+$/, "");
  // If user provided base server domain without /api/auth path
  return trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;
};

const API_BASE_URL = getApiBaseUrl();

export interface FriendDetail {
  id: string;
  username: string;
  profilePic?: string;
  about?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  address?: string;
  profilePic?: string;
  about?: string;
  friends?: string[];
  friendsDetails?: FriendDetail[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User & { accessToken?: string };
}

export interface UsersResponse {
  success: boolean;
  count?: number;
  users?: User[];
  message?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: any;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid response format from server.");
    }
  } else {
    const text = await response.text();
    console.error("Non-JSON API Response received:", text);
    throw new Error(
      `API Server error (${response.status}). Please verify NEXT_PUBLIC_API_URL environment variable is set to the backend service.`
    );
  }

  if (!response.ok && !data?.success) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
