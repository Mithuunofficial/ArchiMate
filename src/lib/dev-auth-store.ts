export interface DevUserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending" | "approved" | "rejected";
  accountStatus: "pending" | "approved" | "rejected" | "suspended";
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

// Global scope persistence for development hot reloads
const globalForDevAuth = global as unknown as {
  devUsersStore?: Map<string, DevUserRecord>;
};

export const devUsersStore =
  globalForDevAuth.devUsersStore || new Map<string, DevUserRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForDevAuth.devUsersStore = devUsersStore;
}

export const DevAuthStore = {
  findByUsername(username: string): DevUserRecord | undefined {
    const key = username.trim().toLowerCase();
    for (const record of Array.from(devUsersStore.values())) {
      if (record.username.toLowerCase() === key) {
        return record;
      }
    }
    return undefined;
  },

  findByEmail(email: string): DevUserRecord | undefined {
    const key = email.trim().toLowerCase();
    for (const record of Array.from(devUsersStore.values())) {
      if (record.email.toLowerCase() === key) {
        return record;
      }
    }
    return undefined;
  },

  createUser(username: string, email: string, passwordHash: string): DevUserRecord {
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const record: DevUserRecord = {
      id,
      username,
      email,
      passwordHash,
      role: "user",
      status: "pending",
      accountStatus: "pending",
      emailVerified: false,
      adminApproved: false,
      createdAt: now,
      updatedAt: now,
    };
    devUsersStore.set(username.toLowerCase(), record);
    return record;
  },
};
