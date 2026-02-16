"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { ListingCard } from "@/components/listing-card";
import { CategoryFilter, categories } from "@/components/category-filter";
import { Footer } from "@/components/footer";
import { MobileSearch } from "@/components/mobile-search";
import { Loader2, X, ChevronRight, ChevronDown, Shield } from "lucide-react";
import Link from "next/link";

type SortOption = "newest" | "oldest" | "price_low" | "price_high";

function HomeContent() {
  const { isAuthenticated } = useConvexAuth();
  const searchParams = useSearchParams();
  const currentUser = useQuery(api.users.getCurrentUser);
  const searchQuery = searchParams.get("search") === "open" ? "" : (searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMobileSearch, setShowMobileSearch] = useState(searchParams.get("search") === "open");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  const listingsData = useQuery(api.listings.getAll, {});
  const listings = listingsData?.page;

  const filteredListings = listings
    ?.filter((listing) => {
      const matchesCategory =
        selectedCategory === "all" || listing.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);
      return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Browse Categories</h3>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        <div className="w-full h-36 md:h-44 rounded-2xl bg-gradient-to-r from-primary to-[#4a8ebf] mb-8 md:mb-12 flex items-center relative overflow-hidden">
          <div className="relative z-10 px-6 md:px-10 text-white max-w-lg">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-3 inline-flex items-center gap-1">
              <Shield className="w-3 h-3" /> Safety First
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-tight">Meet at the Student Centre!</h2>
            <p className="text-white/80 text-xs md:text-sm">
              Use our designated safe exchange zones for all transactions.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {searchQuery && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-muted-foreground">
              Results for &apos;<span className="font-medium">{searchQuery}</span>&apos;
            </span>
            <Link
              href="/"
              className="p-1 hover:bg-gray-200 dark:hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold">Latest on Campus</h2>
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
        </div>

        {listings === undefined ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredListings.map((listing) => (
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
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "No listings found" : "No listings yet"}
            </p>
            <p className="text-muted-foreground/70 mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to post something!"}
            </p>
          </div>
        )}

        {filteredListings && filteredListings.length > 0 && (
          <div className="flex justify-center mt-12 mb-8 md:mb-20">
            <button className="px-8 py-3 rounded-xl border border-gray-200 dark:border-border font-bold hover:bg-white dark:hover:bg-card transition-all flex items-center gap-2">
              Load More Items
            </button>
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileSearch
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        initialQuery={searchQuery}
      />

      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end md:items-center justify-center">
          <div className="bg-white dark:bg-card w-full md:w-[480px] md:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-border">
              <h3 className="font-bold text-lg">All Categories</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-border"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "" : "text-muted-foreground"}`} />
                    <span className={`font-medium ${isSelected ? "" : "text-foreground"}`}>
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
