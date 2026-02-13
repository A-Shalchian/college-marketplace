"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AdminContextType {
  adminId: Id<"users"> | null;
  clerkId: string | null;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  adminId: null,
  clerkId: null,
  isLoading: true,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const value: AdminContextType = {
    adminId: currentUser?._id ?? null,
    clerkId: user?.id ?? null,
    isLoading: !isLoaded || currentUser === undefined,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
}
