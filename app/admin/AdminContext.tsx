"use client";

import { createContext, useContext, ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
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
  const { isLoading: authLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);

  const value: AdminContextType = {
    adminId: currentUser?._id ?? null,
    isLoading: authLoading || currentUser === undefined,
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
