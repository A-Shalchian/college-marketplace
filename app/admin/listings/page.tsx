"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  X,
  ChevronDown,
} from "lucide-react";

type FilterType = "all" | "active" | "flagged" | "rejected" | "removed";

export default function AdminListings() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as FilterType) || "all";

  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<string | null>(
    searchParams.get("id")
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const listings = useQuery(api.admin.getAllListings);

  const approveListing = useMutation(api.admin.approveListing);
  const rejectListing = useMutation(api.admin.rejectListing);
  const removeListing = useMutation(api.admin.removeListing);

  const filteredListings = listings?.filter((listing) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "flagged" && listing.moderationStatus === "flagged") ||
      (filter === "active" && listing.status === "active") ||
      (filter === "rejected" && listing.status === "rejected") ||
      (filter === "removed" && listing.status === "removed");

    const matchesSearch =
      !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selected = listings?.find((l) => l._id === selectedListing);

  const handleApprove = async (listingId: Id<"listings">) => {
    try {
      await approveListing({ listingId });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to approve listing");
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;
    try {
      await rejectListing({
        listingId: selectedListing as Id<"listings">,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedListing(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reject listing");
    }
  };

  const handleRemove = async (listingId: Id<"listings">, reason: string) => {
    try {
      await removeListing({ listingId, reason });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove listing");
    }
  };

  const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: "all", label: "All Listings", count: listings?.length },
    {
      value: "flagged",
      label: "Flagged",
      count: listings?.filter((l) => l.moderationStatus === "flagged").length,
    },
    {
      value: "active",
      label: "Active",
      count: listings?.filter((l) => l.status === "active").length,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: listings?.filter((l) => l.status === "rejected").length,
    },
    {
      value: "removed",
      label: "Removed",
      count: listings?.filter((l) => l.status === "removed").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Listings</h1>
        <p className="text-muted-foreground mt-1">Manage and moderate marketplace listings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search listings..."
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
            <Filter className="w-5 h-5 text-muted-foreground" />
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
            {!filteredListings ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No listings found</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <button
                  key={listing._id}
                  onClick={() => setSelectedListing(listing._id)}
                  className={`w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-muted transition-colors ${
                    selectedListing === listing._id ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center bg-gray-100 dark:bg-muted shrink-0"
                    style={{
                      backgroundImage: listing.imageUrls[0]
                        ? `url(${listing.imageUrls[0]})`
                        : undefined,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium truncate">{listing.title}</p>
                      <span className="text-primary font-bold shrink-0">
                        ${listing.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      by {listing.seller?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          listing.status === "active"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                            : listing.status === "rejected"
                              ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                              : listing.status === "removed"
                                ? "bg-gray-100 dark:bg-muted text-gray-600"
                                : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"
                        }`}
                      >
                        {listing.status.toUpperCase()}
                      </span>
                      {listing.moderationStatus === "flagged" && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          FLAGGED
                        </span>
                      )}
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
                <p>Select a listing to view details</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] overflow-y-auto">
              <div className="aspect-video bg-gray-100 dark:bg-muted relative">
                {selected.imageUrls[0] && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selected.imageUrls[0]})` }}
                  />
                )}
                <button
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold">{selected.title}</h2>
                    <span className="text-xl font-bold text-primary">
                      ${selected.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        selected.status === "active"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                          : selected.status === "rejected"
                            ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                            : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"
                      }`}
                    >
                      {selected.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selected.category} • {selected.condition}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </div>

                {selected.moderationFlags && selected.moderationFlags.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="font-bold text-red-600">Moderation Flags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.moderationFlags.map((flag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 text-sm font-medium rounded-full"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-muted rounded-xl">
                  <div
                    className="w-10 h-10 rounded-full bg-cover bg-center bg-primary/10 dark:bg-primary/20"
                    style={{
                      backgroundImage: selected.seller?.imageUrl
                        ? `url(${selected.seller.imageUrl})`
                        : undefined,
                    }}
                  />
                  <div>
                    <p className="font-medium">{selected.seller?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selected.seller?.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selected.status !== "active" &&
                    selected.moderationStatus === "flagged" && (
                      <button
                        onClick={() => handleApprove(selected._id)}
                        className="flex-1 h-11 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                    )}
                  {selected.status === "active" && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 h-11 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  )}
                  {selected.status !== "removed" && (
                    <button
                      onClick={() => {
                        const reason = prompt("Reason for removal:");
                        if (reason) handleRemove(selected._id, reason);
                      }}
                      className="h-11 px-4 border border-gray-200 dark:border-border rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Listing</h2>
            <p className="text-muted-foreground mb-4">
              Please provide a reason for rejecting this listing.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-muted resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 h-11 border border-gray-200 dark:border-border rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 h-11 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
