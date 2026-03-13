"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  Search,
  ArrowLeft,
  Users,
  MapPin,
} from "lucide-react";

const clubCategories = [
  { id: "all", label: "All Clubs" },
  { id: "Academic", label: "Academic" },
  { id: "Sports", label: "Sports" },
  { id: "Arts", label: "Arts" },
  { id: "Technology", label: "Technology" },
  { id: "Social", label: "Social" },
  { id: "Cultural", label: "Cultural" },
];

const campusFilters = [
  { id: "all", label: "All Campuses" },
  { id: "St. James Campus", label: "St. James" },
  { id: "Casa Loma Campus", label: "Casa Loma" },
  { id: "Waterfront Campus", label: "Waterfront" },
];

function ClubsContent() {
  const { isAuthenticated } = useConvexAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const clubs = useQuery(api.clubs.getClubs, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    campus: selectedCampus === "all" ? undefined : selectedCampus,
  });

  const filteredClubs = clubs?.filter((club) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      club.name.toLowerCase().includes(q) ||
      club.description.toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-primary/10 text-primary",
      Sports: "bg-accent-coral/10 text-accent-coral",
      Arts: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      Technology: "bg-accent-mint/10 text-accent-mint",
      Social: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      Cultural: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/community"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Student Clubs</h1>
            <p className="text-sm text-muted-foreground">Join clubs and connect with like-minded students</p>
          </div>
          {isAuthenticated && (
            <Link
              href="/community/clubs/create"
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Create Club
            </Link>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-none bg-white dark:bg-card py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none border border-gray-100 dark:border-border"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 hide-scrollbar">
          {clubCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 hide-scrollbar">
          {campusFilters.map((campus) => (
            <button
              key={campus.id}
              onClick={() => setSelectedCampus(campus.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCampus === campus.id
                  ? "bg-primary/20 text-primary dark:bg-primary/30"
                  : "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-border"
              }`}
            >
              {campus.label}
            </button>
          ))}
        </div>

        {clubs === undefined ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredClubs && filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClubs.map((club) => (
              <Link
                key={club._id}
                href={`/community/clubs/${club._id}`}
                className="block bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden hover:border-primary/30 transition-all"
              >
                {club.imageUrl && (
                  <div
                    className="w-full h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${club.imageUrl})` }}
                  />
                )}
                <div className={club.imageUrl ? "p-5 pt-3" : "p-5"}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(club.category)}`}>
                    {club.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{club.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {club.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {club.campus}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
                  </span>
                  <span>{getTimeAgo(club.createdAt)}</span>
                </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No clubs yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Be the first to create a club!</p>
            {isAuthenticated && (
              <Link
                href="/community/clubs/create"
                className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Create a Club
              </Link>
            )}
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
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

export default function ClubsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ClubsContent />
    </Suspense>
  );
}
