"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { ListingCard } from "@/components/listing-card";
import { CategoryFilter } from "@/components/category-filter";
import { useStoreUser } from "@/hooks/use-store-user";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

function HomeContent() {
  useStoreUser();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState("all");

  const listings = useQuery(api.listings.getAll);

  const filteredListings = listings?.filter((listing) => {
    const matchesCategory =
      selectedCategory === "all" || listing.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GBC Marketplace
          </h1>
          <p className="text-gray-600">
            Buy and sell with fellow George Brown students
          </p>
        </div>

        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-gray-600">
              Results for &apos;<span className="font-medium">{searchQuery}</span>&apos;
            </span>
            <Link
              href="/"
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Link>
          </div>
        )}

        <div className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {listings === undefined ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredListings && filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing._id}
                id={listing._id}
                title={listing.title}
                price={listing.price}
                images={listing.imageUrls}
                condition={listing.condition}
                sellerName={listing.seller?.name}
                createdAt={listing.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No listings found" : "No listings yet"}
            </p>
            <p className="text-gray-400 mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to post something!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
