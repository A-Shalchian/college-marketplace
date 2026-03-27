"use client";

import { Suspense } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  Plus,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";

function CommunityContent() {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);

  const forumCategories = [
    { id: "general", label: "General", icon: MessageCircle, count: null },
    { id: "course_help", label: "Course Help", icon: BookOpen, count: null },
    { id: "housing", label: "Housing", icon: Home, count: null },
    { id: "campus_life", label: "Campus Life", icon: GraduationCap, count: null },
  ];

  const eventCategories = [
    { id: "social", label: "Social", icon: Heart },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "workshop", label: "Workshop", icon: Monitor },
    { id: "networking", label: "Networking", icon: Globe },
    { id: "cultural", label: "Cultural", icon: Palette },
  ];

  const clubCategories = [
    { id: "Academic", label: "Academic", icon: GraduationCap },
    { id: "Sports", label: "Sports", icon: Trophy },
    { id: "Arts", label: "Arts", icon: Palette },
    { id: "Technology", label: "Technology", icon: Monitor },
    { id: "Social", label: "Social", icon: Heart },
    { id: "Cultural", label: "Cultural", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Connect with GBC students through forums, events, and clubs.
            </p>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
          <Link
            href="/community/forums"
            className="group bg-card border border-border rounded-xl p-4 md:p-5 hover:border-foreground/20 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <MessageSquareText className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Forums</h3>
            <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">Discussion boards</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/community/events"
            className="group bg-card border border-border rounded-xl p-4 md:p-5 hover:border-foreground/20 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Events</h3>
            <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">Campus meetups</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/community/clubs"
            className="group bg-card border border-border rounded-xl p-4 md:p-5 hover:border-foreground/20 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Clubs</h3>
            <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">Student groups</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column - Forums */}
          <div className="space-y-8">
            {/* Forums Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Discussion Forums</h2>
                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <Link
                      href="/community/forums/create"
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline">New Post</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {forumCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/community/forums?category=${cat.id}`}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-foreground/10 transition-colors">
                        <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{cat.label}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/community/forums"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-3 ml-1"
              >
                Browse all discussions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>

            {/* Events Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Campus Events</h2>
                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <Link
                      href="/community/events/create"
                      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/community/events?category=${cat.id}`}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card border border-border hover:border-foreground/20 transition-all text-sm font-medium"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {cat.label}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/community/events"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-3 ml-1"
              >
                Browse all events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>
          </div>

          {/* Right column - Clubs + Quick Links */}
          <div className="space-y-8">
            {/* Clubs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Student Clubs</h2>
                {isAuthenticated && (
                  <Link
                    href="/community/clubs/create"
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {clubCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/community/clubs?category=${cat.id}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border hover:border-foreground/20 transition-all"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/community/clubs"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-3 ml-1"
              >
                Browse all clubs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>

            {/* Safety Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/safety-guidelines"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  Safety Guidelines
                </Link>
                <Link
                  href="/exchange-zones"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  Exchange Zones
                </Link>
                <Link
                  href="/help"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  Help Centre
                </Link>
              </div>
            </div>
          </div>
        </div>
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
