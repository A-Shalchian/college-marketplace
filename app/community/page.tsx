"use client";

import { useState, Suspense } from "react";
import { useConvexAuth } from "convex/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  MessageSquareText,
  Calendar,
  Users,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Home,
  GraduationCap,
  Trophy,
  Palette,
  Monitor,
  Heart,
  Globe,
} from "lucide-react";

type TabType = "forums" | "events" | "clubs";

function CommunityContent() {
  const { isAuthenticated } = useConvexAuth();
  const [activeTab, setActiveTab] = useState<TabType>("forums");

  const tabs: { id: TabType; label: string; icon: React.ElementType; description: string }[] = [
    { id: "forums", label: "Forums", icon: MessageSquareText, description: "Discuss topics with fellow students" },
    { id: "events", label: "Events", icon: Calendar, description: "Campus events and meetups" },
    { id: "clubs", label: "Clubs", icon: Users, description: "Join student groups and clubs" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 md:mb-10">
          <div className="w-full h-36 md:h-44 rounded-2xl bg-gradient-to-r from-primary to-[#4a8ebf] mb-8 flex items-center relative overflow-hidden">
            <div className="relative z-10 px-6 md:px-10 text-white max-w-lg">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-3 inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> Student Hub
              </span>
              <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-tight">Community Center</h2>
              <p className="text-white/80 text-xs md:text-sm">
                Connect with GBC students through forums, events, and clubs.
              </p>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="flex gap-3 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-sm">{tab.label}</p>
                    <p className={`text-[10px] hidden md:block ${activeTab === tab.id ? "text-white/70" : "text-muted-foreground"}`}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "forums" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Discussion Forums</h3>
              {isAuthenticated && (
                <Link
                  href="/community/forums/create"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                >
                  New Post
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "general", label: "General", icon: MessageCircle, color: "bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 dark:border-primary/20" },
                { id: "course_help", label: "Course Help", icon: BookOpen, color: "bg-accent-mint/5 dark:bg-accent-mint/10 text-accent-mint border border-accent-mint/10 dark:border-accent-mint/20" },
                { id: "housing", label: "Housing", icon: Home, color: "bg-accent-coral/5 dark:bg-accent-coral/10 text-accent-coral border border-accent-coral/10 dark:border-accent-coral/20" },
                { id: "campus_life", label: "Campus Life", icon: GraduationCap, color: "bg-primary/5 dark:bg-primary/10 text-[#4a8ebf] border border-[#4a8ebf]/10 dark:border-[#4a8ebf]/20" },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/community/forums?category=${cat.id}`}
                    className={`${cat.color} p-4 rounded-xl flex items-center gap-3 hover:scale-[1.02] transition-transform`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/community/forums"
              className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              Browse all discussions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Campus Events</h3>
              {isAuthenticated && (
                <Link
                  href="/community/events/create"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                >
                  Create Event
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: "social", label: "Social", icon: Heart, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20" },
                { id: "academic", label: "Academic", icon: GraduationCap, color: "bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 dark:border-primary/20" },
                { id: "sports", label: "Sports", icon: Trophy, color: "bg-accent-coral/5 dark:bg-accent-coral/10 text-accent-coral border border-accent-coral/10 dark:border-accent-coral/20" },
                { id: "workshop", label: "Workshop", icon: Monitor, color: "bg-accent-mint/5 dark:bg-accent-mint/10 text-accent-mint border border-accent-mint/10 dark:border-accent-mint/20" },
                { id: "networking", label: "Networking", icon: Globe, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20" },
                { id: "cultural", label: "Cultural", icon: Palette, color: "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/community/events?category=${cat.id}`}
                    className={`${cat.color} p-4 rounded-xl flex items-center gap-3 hover:scale-[1.02] transition-transform`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/community/events"
              className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              Browse all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {activeTab === "clubs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Student Clubs</h3>
              {isAuthenticated && (
                <Link
                  href="/community/clubs/create"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                >
                  Create Club
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: "Academic", label: "Academic", icon: GraduationCap, color: "bg-primary/5 dark:bg-primary/10 text-primary border border-primary/10 dark:border-primary/20" },
                { id: "Sports", label: "Sports", icon: Trophy, color: "bg-accent-coral/5 dark:bg-accent-coral/10 text-accent-coral border border-accent-coral/10 dark:border-accent-coral/20" },
                { id: "Arts", label: "Arts", icon: Palette, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20" },
                { id: "Technology", label: "Technology", icon: Monitor, color: "bg-accent-mint/5 dark:bg-accent-mint/10 text-accent-mint border border-accent-mint/10 dark:border-accent-mint/20" },
                { id: "Social", label: "Social", icon: Heart, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20" },
                { id: "Cultural", label: "Cultural", icon: Globe, color: "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20" },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/community/clubs?category=${cat.id}`}
                    className={`${cat.color} p-4 rounded-xl flex items-center gap-3 hover:scale-[1.02] transition-transform`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/community/clubs"
              className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
            >
              Browse all clubs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CommunityContent />
    </Suspense>
  );
}
