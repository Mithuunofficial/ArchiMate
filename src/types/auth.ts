export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role?: "user" | "admin";
  status?: "active" | "suspended";
  avatarUrl?: string;
  isGuest?: boolean;
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface PasswordResetInput {
  email: string;
}

export interface PasswordUpdateInput {
  password: string;
}

export interface AdminActivityLog {
  id: string;
  adminId?: string;
  adminUsername: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
