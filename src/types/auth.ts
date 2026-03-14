export interface User {
  id: string;
  email: string;
  name?: string;
  role: "customer" | "admin";
  phone?: string;
  address?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}
