"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Flag, ChevronLeft, AlertTriangle, Loader2, Search } from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const reportReasons = [
  "Prohibited or illegal item",
  "Misleading description or photos",
  "Suspected scam or fraud",
  "Inappropriate or offensive content",
  "Spam or duplicate listing",
  "Counterfeit item",
  "Price gouging",
  "Other",
];

function ReportContent() {
  const searchParams = useSearchParams();
  const listingParam = searchParams.get("listing");

  const [selectedListingId, setSelectedListingId] = useState<string>(listingParam || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const createReport = useMutation(api.admin.createReport);

  // Fetch listing details if we have an ID
  const selectedListing = useQuery(
    api.listings.getById,
    selectedListingId
      ? { listingId: selectedListingId as Id<"listings"> }
      : "skip"
  );

  // Fetch all listings for search
  const allListings = useQuery(api.listings.getAll, {});

  const filteredListings = allListings?.page?.filter((l) =>
    searchQuery.trim() &&
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("You must be signed in to report a listing.");
      return;
    }
    if (!selectedListingId) {
      setError("Please select a listing to report.");
      return;
    }
    if (!reason) {
      setError("Please select a reason for your report.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a description of the issue.");
      return;
    }

    setSubmitting(true);
    try {
      await createReport({
        listingId: selectedListingId as Id<"listings">,
        reporterId: currentUser._id,
        reason,
        description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Report Submitted</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep GBC Marketplace safe. Our admin team
              will review your report and take appropriate action.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Report a Listing</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Help us maintain a safe marketplace by reporting listings that violate
          our community guidelines.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            False reports may result in action against your account. Please only
            report genuine violations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium mb-2">
              Select Listing <span className="text-red-500">*</span>
            </label>

            {selectedListing && selectedListingId ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                {selectedListing.imageUrls[0] && (
                  <div
                    className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${selectedListing.imageUrls[0]})` }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedListing.title}</p>
                  <p className="text-xs text-muted-foreground">${selectedListing.price} &middot; {selectedListing.seller?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedListingId("");
                    setSearchQuery("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a listing by title..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {searchQuery.trim() && filteredListings.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredListings.slice(0, 8).map((listing) => (
                      <button
                        key={listing._id}
                        type="button"
                        onClick={() => {
                          setSelectedListingId(listing._id);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                      >
                        {listing.imageUrls[0] && (
                          <div
                            className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url(${listing.imageUrls[0]})` }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{listing.title}</p>
                          <p className="text-xs text-muted-foreground">${listing.price} &middot; {listing.seller?.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && filteredListings.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 p-4 text-center">
                    <p className="text-sm text-muted-foreground">No listings found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium mb-3">
              Reason for Report <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reportReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    reason === r
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail. Include any relevant information that will help us investigate."
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ReportContent />
    </Suspense>
  );
}
