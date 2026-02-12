"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AdminContextType {
  adminId: Id<"users"> | null;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  adminId: null,
  isLoading: true,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });

  const value: AdminContextType = {
    adminId: currentUser?._id ?? null,
    isLoading: currentUser === undefined,
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
