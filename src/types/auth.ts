export interface User {
  id: string;
  email: string;
  name?: string;
  role: "customer" | "admin" | "superadmin" | "seller";
  phone?: string;
  address?: string;
  /** Present after GET /auth/me — whether face login was enrolled. */
  hasFaceLogin?: boolean;
  /** Present after GET /auth/me */
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OptionalAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

/** POST /auth/register — tokens null until email verified (step 2). */
export interface RegisterApiResponse {
  user: User;
  tokens: OptionalAuthTokens;
  requiresEmailVerification?: boolean;
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
  role?: string;
  /** Required: 2–5 face-api.js descriptors (frontend sends 3 at registration). */
  faceDescriptors: number[][];
}
