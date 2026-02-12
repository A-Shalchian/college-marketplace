"use client";

import { Search, X, Sparkles, Book, Laptop, Armchair, Shirt, Bike, MoreHorizontal, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

const categories = [
  { id: "textbooks", label: "Textbooks", icon: Book },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "furniture", label: "Furniture", icon: Armchair },
  { id: "clothing", label: "Fashion", icon: Shirt },
  { id: "transportation", label: "Transport", icon: Bike },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function MobileSearch({ isOpen, onClose, initialQuery = "" }: MobileSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const listingsData = useQuery(api.listings.getAll, {});
  const recentListings = listingsData?.page?.slice(0, 4);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
    onClose();
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/?category=${categoryId}`);
    onClose();
  };

  const handlePopularSearch = (term: string) => {
    setQuery(term);
    router.push(`/?search=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background md:hidden overflow-y-auto">
      <div className="flex flex-col min-h-full">
        <div className="sticky top-0 bg-background z-10 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            <form onSubmit={handleSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search textbooks, electronics..."
                  className="w-full h-12 pl-11 pr-4 bg-gray-100 dark:bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {["Textbooks", "MacBook", "Calculator", "Desk", "Winter Jacket"].map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularSearch(term)}
                  className="px-4 py-2 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-full text-sm font-medium hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Browse by category</p>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {recentListings && recentListings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">Recently added</p>
              </div>
              <div className="space-y-2">
                {recentListings.map((listing) => (
                  <button
                    key={listing._id}
                    onClick={() => {
                      router.push(`/listings/${listing._id}`);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl hover:border-primary/30 dark:hover:border-primary/30 transition-colors text-left"
                  >
                    {listing.imageUrls[0] ? (
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${listing.imageUrls[0]})` }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{listing.title}</p>
                      <p className="text-primary font-bold text-sm">${listing.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
