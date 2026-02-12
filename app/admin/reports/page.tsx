"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  Flag,
  CheckCircle,
  Loader2,
  Eye,
  X,
  ChevronDown,
  AlertTriangle,
  User,
  ExternalLink,
  Trash2,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { useAdminContext } from "../AdminContext";

type FilterType = "all" | "pending" | "resolved";

export default function AdminReports() {
  const { adminId } = useAdminContext();
  const [filter, setFilter] = useState<FilterType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const reports = useQuery(api.admin.getAllReports, {});

  const resolveReport = useMutation(api.admin.resolveReport);
  const removeListing = useMutation(api.admin.removeListing);
  const banUser = useMutation(api.admin.banUser);

  const filteredReports = reports?.filter((report) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && report.status === "pending") ||
      (filter === "resolved" && report.status === "resolved");

    const matchesSearch =
      !searchQuery ||
      report.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selected = reports?.find((r) => r._id === selectedReport);

  const handleResolve = async (action: string) => {
    if (!selectedReport) return;
    try {
      await resolveReport({
        reportId: selectedReport as Id<"reports">,
        action,
      });
      setSelectedReport(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to resolve report");
    }
  };

  const handleRemoveListing = async () => {
    if (!selected?.listing) return;
    try {
      await removeListing({
        listingId: selected.listing._id,
        reason: `Removed due to report: ${selected.reason}`,
      });
      await handleResolve("listing_removed");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove listing");
    }
  };

  const handleBanUser = async () => {
    if (!selected?.listing) return;
    const reason = prompt("Reason for ban:");
    if (!reason) return;
    try {
      await banUser({
        userId: selected.listing.sellerId,
        reason,
      });
      await handleResolve("user_banned");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to ban user");
    }
  };

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: "all", label: "All Reports", count: reports?.length },
    {
      value: "pending",
      label: "Pending",
      count: reports?.filter((r) => r.status === "pending").length,
    },
    {
      value: "resolved",
      label: "Resolved",
      count: reports?.filter((r) => r.status === "resolved").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Review user-submitted reports</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
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
            <Flag className="w-5 h-5 text-muted-foreground" />
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
            {!filteredReports ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p>No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReport(report._id)}
                  className={`w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors ${
                    selectedReport === report._id ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      report.status === "pending"
                        ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                        : "bg-green-100 dark:bg-green-900/20 text-green-600"
                    }`}
                  >
                    {report.status === "pending" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {report.listing?.title || "Deleted Listing"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Reported by {report.reporter?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-bold rounded-full">
                        {report.reason}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(report.createdAt)}
                      </span>
                    </div>
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
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a report to view details</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 dark:border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">Report Details</h2>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          selected.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"
                            : "bg-green-100 dark:bg-green-900/20 text-green-600"
                        }`}
                      >
                        {selected.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted {getTimeAgo(selected.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-5 h-5 text-red-600" />
                    <p className="font-bold text-red-600">Report Reason</p>
                  </div>
                  <p className="text-sm font-medium text-red-600 mb-2">{selected.reason}</p>
                  {selected.description && (
                    <p className="text-sm text-red-600/80">{selected.description}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-3">Reported By</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-muted rounded-xl">
                    <div
                      className="w-10 h-10 rounded-full bg-cover bg-center bg-primary/10 dark:bg-primary/20"
                      style={{
                        backgroundImage: selected.reporter?.imageUrl
                          ? `url(${selected.reporter.imageUrl})`
                          : undefined,
                      }}
                    >
                      {!selected.reporter?.imageUrl && (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selected.reporter?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selected.reporter?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {selected.listing && (
                  <div>
                    <h3 className="font-medium mb-3">Reported Listing</h3>
                    <Link
                      href={`/admin/listings?id=${selected.listing._id}`}
                      className="block p-4 bg-gray-50 dark:bg-muted rounded-xl hover:bg-gray-100 dark:hover:bg-border transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{selected.listing.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${selected.listing.price} • {selected.listing.category}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {selected.listing.description}
                          </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  </div>
                )}

                {selected.status === "pending" && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Actions</h3>
                    <button
                      onClick={() => handleResolve("dismissed")}
                      className="w-full h-11 border border-gray-200 dark:border-border rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Dismiss Report
                    </button>
                    {selected.listing && (
                      <>
                        <button
                          onClick={handleRemoveListing}
                          className="w-full h-11 bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                          Remove Listing
                        </button>
                        <button
                          onClick={handleBanUser}
                          className="w-full h-11 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                        >
                          <Ban className="w-5 h-5" />
                          Ban Seller
                        </button>
                      </>
                    )}
                  </div>
                )}

                {selected.status === "resolved" && selected.resolvedByUser && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-bold text-green-600">Resolved</p>
                    </div>
                    <p className="text-sm text-green-600">
                      by {selected.resolvedByUser.name} on{" "}
                      {selected.resolvedAt
                        ? new Date(selected.resolvedAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
