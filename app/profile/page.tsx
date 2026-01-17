"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Loader2,
  ShoppingBag,
  CheckCircle,
  Star,
  Calendar,
  Settings,
  Pencil,
  Trash2,
  Heart,
  MapPin,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type TabType = "active" | "sold";

function ProfileContent() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("active");

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const myListings = useQuery(
    api.listings.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const deleteListing = useMutation(api.listings.deleteListing);
  const updateStatus = useMutation(api.listings.updateStatus);

  const handleDelete = async (listingId: Id<"listings">) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteListing({ listingId });
    }
  };

  const handleMarkAsSold = async (listingId: Id<"listings">) => {
    await updateStatus({ listingId, status: "sold" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to view your profile</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (currentUser === undefined || myListings === undefined) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const activeListings = myListings?.filter((l) => l.status === "active") ?? [];
  const soldListings = myListings?.filter((l) => l.status === "sold") ?? [];
  const displayedListings = activeTab === "active" ? activeListings : soldListings;

  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <section className="mb-8 md:mb-10">
          <div className="bg-white rounded-xl p-6 md:p-8 subtle-float flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start justify-between border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative">
                {user.imageUrl ? (
                  <div
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-cover bg-center border-4 border-white shadow-xl"
                    style={{ backgroundImage: `url(${user.imageUrl})` }}
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 border-4 border-white shadow-xl flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-accent-mint text-white p-1.5 rounded-full shadow-lg flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {user.fullName}
                  </h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    GBC Student
                  </span>
                </div>
                <p className="text-gray-500 font-medium mb-4">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Joined {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-accent-coral" />
                    <span className="text-xs font-semibold">Toronto, ON</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border-2 border-gray-100 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
              <button className="px-4 py-3 rounded-xl bg-gray-100 font-bold text-sm hover:bg-gray-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white p-4 md:p-6 rounded-xl subtle-float border border-gray-100 flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">{activeListings.length}</p>
              <p className="text-[10px] md:text-sm font-medium text-gray-500">Active</p>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl subtle-float border border-gray-100 flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent-mint/10 text-accent-mint flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">{soldListings.length}</p>
              <p className="text-[10px] md:text-sm font-medium text-gray-500">Sold</p>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl subtle-float border border-gray-100 flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">5.0</p>
              <p className="text-[10px] md:text-sm font-medium text-gray-500">Rating</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-gray-200 mb-6 md:mb-8">
            <div className="flex gap-6 md:gap-10">
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "active"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Active Listings
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "active" ? "bg-primary/10" : "bg-gray-100"
                  }`}
                >
                  {activeListings.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("sold")}
                className={`pb-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "sold"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Sold Items
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "sold" ? "bg-primary/10" : "bg-gray-100"
                  }`}
                >
                  {soldListings.length}
                </span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-400">
              <span>Sort: Newest</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {displayedListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {displayedListings.map((listing) => (
                <div
                  key={listing._id}
                  className="group bg-white rounded-xl overflow-hidden subtle-float border border-gray-100 hover:scale-[1.02] transition-transform"
                >
                  <Link href={`/listings/${listing._id}`}>
                    <div
                      className="aspect-square bg-cover bg-center relative"
                      style={{
                        backgroundImage: listing.imageUrls[0]
                          ? `url(${listing.imageUrls[0]})`
                          : undefined,
                        backgroundColor: listing.imageUrls[0] ? undefined : "#f3f4f6",
                      }}
                    >
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-extrabold uppercase text-primary">
                        {listing.category}
                      </div>
                      {activeTab === "active" && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleMarkAsSold(listing._id);
                            }}
                            className="p-1.5 bg-accent-mint text-white rounded-full hover:bg-accent-mint/80"
                            title="Mark as sold"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(listing._id);
                            }}
                            className="p-1.5 bg-accent-coral text-white rounded-full hover:bg-accent-coral/80"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {activeTab === "sold" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 md:p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm md:text-base truncate pr-2">
                        {listing.title}
                      </h3>
                      <span className="text-primary font-extrabold text-sm md:text-base shrink-0">
                        ${listing.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-gray-400">
                      <span>{getTimeAgo(listing.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Toronto
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                {activeTab === "active" ? "No active listings" : "No sold items yet"}
              </p>
              {activeTab === "active" && (
                <Link
                  href="/sell"
                  className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Create your first listing
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomNav />
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

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
