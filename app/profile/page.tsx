"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, useClerk } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
  MapPin,
  ChevronDown,
  BadgeCheck,
  LogOut,
  HelpCircle,
  Building,
  X,
  Moon,
  Sun,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/components/providers/theme-provider";
import { ListingCard } from "@/components/listing-card";

const campuses = [
  "St. James Campus",
  "Casa Loma Campus",
  "Waterfront Campus",
];

type TabType = "active" | "sold" | "saved";
type SortOption = "newest" | "oldest" | "price_low" | "price_high";

function ProfileContent() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low",
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
  };

  const hasActiveFilters = minPrice || maxPrice;

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const myListings = useQuery(
    api.listings.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const savedListings = useQuery(
    api.savedListings.getSavedByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const deleteListing = useMutation(api.listings.deleteListing);
  const updateStatus = useMutation(api.listings.updateStatus);
  const updateDefaultCampus = useMutation(api.users.updateDefaultCampus);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCampusChange = async (campus: string) => {
    if (!currentUser) return;
    await updateDefaultCampus({
      userId: currentUser._id,
      defaultCampus: campus,
    });
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  const handleDelete = async (listingId: Id<"listings">) => {
    if (!currentUser || !user?.id) return;
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteListing({ clerkId: user.id, listingId });
    }
  };

  const handleMarkAsSold = async (listingId: Id<"listings">) => {
    if (!currentUser || !user?.id) return;
    await updateStatus({ clerkId: user.id, listingId, status: "sold" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (currentUser === undefined || myListings === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const filterAndSort = (listings: typeof myListings) => {
    if (!listings) return [];
    return listings
      .filter((l) => {
        const matchesMinPrice = !minPrice || l.price >= parseFloat(minPrice);
        const matchesMaxPrice = !maxPrice || l.price <= parseFloat(maxPrice);
        return matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest": return b.createdAt - a.createdAt;
          case "oldest": return a.createdAt - b.createdAt;
          case "price_low": return a.price - b.price;
          case "price_high": return b.price - a.price;
          default: return 0;
        }
      });
  };

  const activeListings = myListings?.filter((l) => l.status === "active") ?? [];
  const soldListings = myListings?.filter((l) => l.status === "sold") ?? [];
  const displayedListings =
    activeTab === "active"
      ? filterAndSort(activeListings)
      : activeTab === "sold"
        ? filterAndSort(soldListings)
        : [];

  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <section className="mb-8 md:mb-10">
          <div className="bg-white dark:bg-card rounded-xl p-6 md:p-8 subtle-float flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start justify-between border border-gray-100 dark:border-border">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative">
                {user.imageUrl ? (
                  <div
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-cover bg-center border-4 border-white dark:border-card shadow-xl"
                    style={{ backgroundImage: `url(${user.imageUrl})` }}
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-primary/10 dark:bg-primary/20 border-4 border-white dark:border-card shadow-xl flex items-center justify-center">
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
                <p className="text-muted-foreground font-medium mb-4">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-muted px-3 py-1.5 rounded-lg border border-gray-100 dark:border-border">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Joined {joinDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-muted px-3 py-1.5 rounded-lg border border-gray-100 dark:border-border">
                    <MapPin className="w-4 h-4 text-accent-coral" />
                    <span className="text-xs font-semibold">Toronto, ON</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => openUserProfile()}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl border-2 border-gray-100 dark:border-border font-bold text-sm hover:bg-gray-50 dark:hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                    showSettings ? "bg-primary text-white" : "bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-border"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-primary" />
                        <span className="font-bold text-sm">Default Campus</span>
                      </div>
                      <select
                        value={currentUser?.defaultCampus || ""}
                        onChange={(e) => handleCampusChange(e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-muted px-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Select default campus</option>
                        {campuses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Auto-fills when creating new listings
                      </p>
                    </div>
                    <div className="p-4 border-b border-gray-100 dark:border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {theme === "dark" ? (
                            <Moon className="w-5 h-5 text-primary" />
                          ) : (
                            <Sun className="w-5 h-5 text-primary" />
                          )}
                          <span className="font-bold text-sm">Dark Mode</span>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            theme === "dark" ? "bg-primary" : "bg-gray-200 dark:bg-border"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              theme === "dark" ? "left-7" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowSettings(false);
                          setShowHelpModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors text-left"
                      >
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-sm">Help & Support</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent-coral/10 text-accent-coral transition-colors text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl subtle-float border border-gray-100 dark:border-border flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">{activeListings.length}</p>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Active</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl subtle-float border border-gray-100 dark:border-border flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent-mint/10 text-accent-mint flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">{soldListings.length}</p>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Sold</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl subtle-float border border-gray-100 dark:border-border flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">{savedListings?.length ?? 0}</p>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Saved</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card p-4 md:p-6 rounded-xl subtle-float border border-gray-100 dark:border-border flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold">5.0</p>
              <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Rating</p>
            </div>
          </div>
        </section>

        <section id="listings" className="scroll-mt-24">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-border mb-6 md:mb-8">
            <div className="flex gap-6 md:gap-10">
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "active"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Active Listings
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "active" ? "bg-primary/10" : "bg-gray-100 dark:bg-muted"
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
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Sold Items
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "sold" ? "bg-primary/10" : "bg-gray-100 dark:bg-muted"
                  }`}
                >
                  {soldListings.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`pb-4 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors ${
                  activeTab === "saved"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Saved Items
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === "saved" ? "bg-primary/10" : "bg-gray-100 dark:bg-muted"
                  }`}
                >
                  {savedListings?.length ?? 0}
                </span>
              </button>
            </div>
            {activeTab !== "saved" && (
              <div className="flex items-center gap-2">
                <div className="relative" ref={filterMenuRef}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                      hasActiveFilters
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-card border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-muted"
                    }`}
                  >
                    {hasActiveFilters ? `$${minPrice || "0"} - $${maxPrice || "∞"}` : "Price"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>
                  {showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-card rounded-xl shadow-lg border border-gray-100 dark:border-border z-50 p-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Price Range</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                      </div>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm font-semibold text-accent-coral hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="relative" ref={sortMenuRef}>
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="bg-white dark:bg-card px-3 py-1.5 rounded-lg border border-gray-100 dark:border-border text-sm font-semibold flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                  >
                    {sortLabels[sortBy]} <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-card rounded-xl shadow-lg border border-gray-100 dark:border-border z-50 overflow-hidden">
                      {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            sortBy === option
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-gray-50 dark:hover:bg-muted"
                          }`}
                        >
                          {sortLabels[option]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {activeTab === "saved" ? (
            savedListings && savedListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {savedListings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    id={listing._id}
                    title={listing.title}
                    price={listing.price}
                    images={listing.imageUrls}
                    condition={listing.condition}
                    sellerName={listing.seller?.name}
                    sellerImage={listing.seller?.imageUrl}
                    sellerId={listing.sellerId}
                    currentUserId={currentUser?._id}
                    createdAt={listing.createdAt}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border">
                <Heart className="w-12 h-12 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No saved items yet</p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            )
          ) : displayedListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {displayedListings.map((listing) => (
                <div
                  key={listing._id}
                  className="group bg-white dark:bg-card rounded-xl overflow-hidden subtle-float border border-gray-100 dark:border-border hover:scale-[1.02] transition-transform"
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
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-card/90 backdrop-blur rounded-lg text-[10px] font-extrabold uppercase text-primary">
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
                    <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-muted-foreground">
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
            <div className="text-center py-16 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border">
              <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
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

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Help & Support</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 dark:bg-muted rounded-lg font-medium text-sm">
                      How do I create a listing?
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="p-3 text-sm text-muted-foreground">
                      Click the &quot;Post Item&quot; button in the navigation bar. Fill in your item details, add photos, set a price, and publish!
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 dark:bg-muted rounded-lg font-medium text-sm">
                      How do I contact a seller?
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="p-3 text-sm text-muted-foreground">
                      Go to any listing and click &quot;Message Seller&quot;. You can chat directly through our messaging system.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 dark:bg-muted rounded-lg font-medium text-sm">
                      Is this only for GBC students?
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="p-3 text-sm text-muted-foreground">
                      Yes! GBC Market is exclusively for George Brown College students. You must sign up with your @georgebrown.ca email.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 dark:bg-muted rounded-lg font-medium text-sm">
                      Where should I meet buyers/sellers?
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="p-3 text-sm text-muted-foreground">
                      Always meet in well-lit, public campus areas like the Student Centre, Library, or designated Safe Exchange Zones.
                    </p>
                  </details>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Contact Us</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Need more help? Reach out to our support team.
                </p>
                <a
                  href="mailto:support@gbcmarket.ca"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  support@gbcmarket.ca
                </a>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-border">
                <p className="text-xs text-muted-foreground text-center">
                  GBC Market v1.0 • Made for George Brown College Students
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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
