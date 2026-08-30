export type AccountStatus = "pending" | "approved" | "rejected" | "suspended";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending" | "approved" | "rejected";
  accountStatus: AccountStatus;
  emailVerified: boolean;
  adminApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  suspendedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role?: "user" | "admin";
  status?: "active" | "suspended" | "pending" | "approved" | "rejected";
  accountStatus?: AccountStatus;
  emailVerified?: boolean;
  adminApproved?: boolean;
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
