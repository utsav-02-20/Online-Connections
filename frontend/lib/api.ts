const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/+$/, "");
    return trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;
  }
  const port = process.env.NEXT_PUBLIC_BACKEND_PORT || "5000";
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol || "http:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:${port}/api/auth`;
  }
  return `http://localhost:${port}/api/auth`;
};

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

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok && !data.success) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
