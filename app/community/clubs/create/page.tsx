"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Users,
} from "lucide-react";

const categories = [
  { id: "Academic", label: "Academic" },
  { id: "Sports", label: "Sports" },
  { id: "Arts", label: "Arts" },
  { id: "Technology", label: "Technology" },
  { id: "Social", label: "Social" },
  { id: "Cultural", label: "Cultural" },
];

const campuses = [
  { id: "St. James Campus", label: "St. James Campus" },
  { id: "Casa Loma Campus", label: "Casa Loma Campus" },
  { id: "Waterfront Campus", label: "Waterfront Campus" },
];

function CreateClubContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createClub = useMutation(api.clubs.createClub);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [campus, setCampus] = useState("St. James Campus");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setError("");

    if (name.trim().length < 3) {
      setError("Club name must be at least 3 characters");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const clubId = await createClub({
        name: name.trim(),
        description: description.trim(),
        category,
        campus,
      });
      router.push(`/community/clubs/${clubId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create club");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to create a club</p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[700px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/community/clubs"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create a Club</h1>
            <p className="text-sm text-muted-foreground">Start a new student group at GBC</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Club Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GBC Coding Club"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{name.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is your club about? What activities do you plan?"
                rows={6}
                maxLength={5000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/5,000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Campus</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <Link
              href="/community/clubs"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CreateClubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateClubContent />
    </Suspense>
  );
}
