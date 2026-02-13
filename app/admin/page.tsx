"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  ShoppingBag,
  Flag,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useAdminContext } from "./AdminContext";

export default function AdminDashboard() {
  const { clerkId } = useAdminContext();

  const stats = useQuery(api.admin.getStats, clerkId ? { clerkId } : "skip");
  const recentActivity = useQuery(api.admin.getRecentActivity, clerkId ? { clerkId } : "skip");
  const flaggedListings = useQuery(api.admin.getFlaggedListings, clerkId ? { clerkId } : "skip");

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your marketplace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center gap-1 text-xs text-green-600">
            <UserPlus className="w-3 h-3" />
            <span>+{stats.newUsersThisWeek} this week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.activeListings}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Active Listings</p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>{stats.totalListings} total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.pendingReview}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Pending Review</p>
            </div>
          </div>
          {stats.pendingReview > 0 && (
            <Link
              href="/admin/listings?filter=flagged"
              className="mt-3 md:mt-4 text-xs text-primary font-medium hover:underline block"
            >
              Review now →
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.pendingReports}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Open Reports</p>
            </div>
          </div>
          {stats.pendingReports > 0 && (
            <Link
              href="/admin/reports"
              className="mt-3 md:mt-4 text-xs text-primary font-medium hover:underline block"
            >
              View reports →
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-border flex items-center justify-between">
            <h2 className="font-bold text-lg">Flagged Listings</h2>
            <Link
              href="/admin/listings?filter=flagged"
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-border">
            {!flaggedListings ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : flaggedListings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No flagged listings</p>
              </div>
            ) : (
              flaggedListings.slice(0, 5).map((listing) => (
                <Link
                  key={listing._id}
                  href={`/admin/listings?id=${listing._id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-lg bg-cover bg-center bg-gray-100 dark:bg-muted shrink-0"
                    style={{
                      backgroundImage: listing.imageUrls[0]
                        ? `url(${listing.imageUrls[0]})`
                        : undefined,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{listing.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      by {listing.seller?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[120px]">
                    {listing.moderationFlags?.slice(0, 2).map((flag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-medium rounded-full"
                      >
                        {flag.split(":")[0]}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-border">
            <h2 className="font-bold text-lg">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-border max-h-[400px] overflow-y-auto">
            {!recentActivity ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((log) => (
                <div key={log._id} className="p-4 flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.action.includes("ban")
                        ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                        : log.action.includes("approve")
                          ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                          : log.action.includes("reject") || log.action.includes("remove")
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"
                            : "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                    }`}
                  >
                    {log.action.includes("approve") ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : log.action.includes("reject") || log.action.includes("remove") ? (
                      <XCircle className="w-4 h-4" />
                    ) : log.action.includes("ban") ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.admin?.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </p>
                    {log.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {log.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <p className="text-sm text-muted-foreground">Banned Users</p>
          <p className="text-2xl font-bold mt-1">{stats.bannedUsers}</p>
        </div>
        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <p className="text-sm text-muted-foreground">Rejected Listings</p>
          <p className="text-2xl font-bold mt-1">{stats.rejectedListings}</p>
        </div>
        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <p className="text-sm text-muted-foreground">Resolved Reports</p>
          <p className="text-2xl font-bold mt-1">{stats.resolvedReports}</p>
        </div>
        <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl border border-gray-100 dark:border-border">
          <p className="text-sm text-muted-foreground">New Today</p>
          <p className="text-2xl font-bold mt-1">{stats.newUsersToday}</p>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
