const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

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

  const data = await response.json();

  if (!response.ok && !data.success) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
