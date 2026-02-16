"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  Shield,
  ShieldOff,
  AlertTriangle,
  Loader2,
  User,
  ShoppingBag,
  Calendar,
  X,
  ChevronDown,
  Crown,
  Ban,
} from "lucide-react";

type FilterType = "all" | "active" | "banned" | "admins";

export default function AdminUsers() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const users = useQuery(api.admin.getAllUsers);

  const banUser = useMutation(api.admin.banUser);
  const unbanUser = useMutation(api.admin.unbanUser);
  const warnUser = useMutation(api.admin.warnUser);
  const setUserRole = useMutation(api.admin.setUserRole);

  const filteredUsers = users?.filter((u) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "banned" && u.isBanned) ||
      (filter === "active" && !u.isBanned) ||
      (filter === "admins" && (u.role === "admin" || u.role === "super_admin"));

    const matchesSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selected = users?.find((u) => u._id === selectedUser);

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      await banUser({
        userId: selectedUser as Id<"users">,
        reason: banReason,
      });
      setShowBanModal(false);
      setBanReason("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to ban user");
    }
  };

  const handleUnban = async (userId: Id<"users">) => {
    try {
      await unbanUser({ userId });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to unban user");
    }
  };

  const handleWarn = async (userId: Id<"users">) => {
    const reason = prompt("Reason for warning:");
    if (reason) {
      try {
        await warnUser({ userId, reason });
      } catch (error) {
        alert(error instanceof Error ? error.message : "Failed to warn user");
      }
    }
  };

  const handleSetRole = async (role: string) => {
    if (!selectedUser) return;
    try {
      await setUserRole({
        userId: selectedUser as Id<"users">,
        role,
      });
      setShowRoleModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to change role");
    }
  };

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: "all", label: "All Users", count: users?.length },
    {
      value: "active",
      label: "Active",
      count: users?.filter((u) => !u.isBanned).length,
    },
    {
      value: "banned",
      label: "Banned",
      count: users?.filter((u) => u.isBanned).length,
    },
    {
      value: "admins",
      label: "Admins",
      count: users?.filter((u) => u.role === "admin" || u.role === "super_admin").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage marketplace users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="h-11 px-4 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-center gap-2 font-medium hover:bg-gray-50 dark:hover:bg-muted transition-colors w-full sm:w-auto justify-between"
          >
            <span>{filterOptions.find((f) => f.value === filter)?.label}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {showFilterDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-card rounded-xl shadow-lg border border-gray-100 dark:border-border z-20 overflow-hidden">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-muted transition-colors ${
                      filter === option.value ? "bg-primary/5 text-primary" : ""
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-border">
            {!filteredUsers ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelectedUser(u._id)}
                  className={`w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors ${
                    selectedUser === u._id ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full bg-cover bg-center bg-primary/10 dark:bg-primary/20 shrink-0"
                    style={{
                      backgroundImage: u.imageUrl ? `url(${u.imageUrl})` : undefined,
                    }}
                  >
                    {!u.imageUrl && (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{u.name}</p>
                      {(u.role === "admin" || u.role === "super_admin") && (
                        <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {u.isBanned ? (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-bold rounded-full">
                        BANNED
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {u.listingCount} listings
                      </span>
                    )}
                    {(u.warningCount ?? 0) > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 text-[10px] font-bold rounded-full">
                        {u.warningCount} warnings
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
          {!selected ? (
            <div className="p-8 text-center text-muted-foreground h-[600px] flex items-center justify-center">
              <div>
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a user to view details</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-border flex items-start gap-4">
                <div
                  className="w-20 h-20 rounded-full bg-cover bg-center bg-primary/10 dark:bg-primary/20 shrink-0"
                  style={{
                    backgroundImage: selected.imageUrl
                      ? `url(${selected.imageUrl})`
                      : undefined,
                  }}
                >
                  {!selected.imageUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    {(selected.role === "admin" || selected.role === "super_admin") && (
                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 text-xs font-bold rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        {selected.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                      </span>
                    )}
                    {selected.isBanned && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-full">
                        BANNED
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">{selected.email}</p>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-muted p-4 rounded-xl text-center">
                    <ShoppingBag className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xl font-bold">{selected.listingCount}</p>
                    <p className="text-xs text-muted-foreground">Total Listings</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-muted p-4 rounded-xl text-center">
                    <ShoppingBag className="w-5 h-5 mx-auto text-green-500 mb-1" />
                    <p className="text-xl font-bold">{selected.activeListingCount}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-muted p-4 rounded-xl text-center">
                    <AlertTriangle className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                    <p className="text-xl font-bold">{selected.warningCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-muted rounded-xl">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Joined</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selected.createdAt ?? Date.now()).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {selected.defaultCampus && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-muted rounded-xl">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Default Campus</p>
                        <p className="text-xs text-muted-foreground">
                          {selected.defaultCampus}
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.isBanned && selected.banReason && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Ban className="w-5 h-5 text-red-600" />
                        <p className="font-bold text-red-600">Ban Reason</p>
                      </div>
                      <p className="text-sm text-red-600">{selected.banReason}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="w-full h-11 border border-gray-200 dark:border-border rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                  >
                    <Crown className="w-5 h-5" />
                    Change Role
                  </button>
                  <button
                    onClick={() => handleWarn(selected._id)}
                    className="w-full h-11 bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Issue Warning
                  </button>
                  {selected.isBanned ? (
                    <button
                      onClick={() => handleUnban(selected._id)}
                      className="w-full h-11 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                      <ShieldOff className="w-5 h-5" />
                      Unban User
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowBanModal(true)}
                      className="w-full h-11 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <Ban className="w-5 h-5" />
                      Ban User
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Ban User</h2>
            <p className="text-muted-foreground mb-4">
              This will ban the user and remove all their active listings.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-muted resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason("");
                }}
                className="flex-1 h-11 border border-gray-200 dark:border-border rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim()}
                className="flex-1 h-11 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Change User Role</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleSetRole("user")}
                className="w-full p-4 border border-gray-200 dark:border-border rounded-xl text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                <p className="font-bold">User</p>
                <p className="text-sm text-muted-foreground">Standard user access</p>
              </button>
              <button
                onClick={() => handleSetRole("admin")}
                className="w-full p-4 border border-gray-200 dark:border-border rounded-xl text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                <p className="font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Admin
                </p>
                <p className="text-sm text-muted-foreground">
                  Can moderate content and manage users
                </p>
              </button>
              <button
                onClick={() => handleSetRole("super_admin")}
                className="w-full p-4 border border-gray-200 dark:border-border rounded-xl text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                <p className="font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  Super Admin
                </p>
                <p className="text-sm text-muted-foreground">Full administrative access</p>
              </button>
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full h-11 mt-4 border border-gray-200 dark:border-border rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
