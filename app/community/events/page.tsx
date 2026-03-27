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
  Calendar,
  MapPin,
  Users,
  Clock,
} from "lucide-react";

const eventCategories = [
  { id: "all", label: "All Events" },
  { id: "social", label: "Social" },
  { id: "academic", label: "Academic" },
  { id: "sports", label: "Sports" },
  { id: "workshop", label: "Workshop" },
  { id: "networking", label: "Networking" },
  { id: "cultural", label: "Cultural" },
];

const campusFilters = [
  { id: "all", label: "All Campuses" },
  { id: "St. James Campus", label: "St. James" },
  { id: "Casa Loma Campus", label: "Casa Loma" },
  { id: "Waterfront Campus", label: "Waterfront" },
];

const timeFilters = [
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "past", label: "Past" },
];

function EventsContent() {
  const { isAuthenticated } = useConvexAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  const events = useQuery(api.events.getEvents, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    campus: selectedCampus === "all" ? undefined : selectedCampus,
    status: selectedTime === "all" ? undefined : selectedTime,
  });

  const filteredEvents = events?.filter((event) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      academic: "bg-primary/10 text-primary",
      sports: "bg-accent-coral/10 text-accent-coral",
      workshop: "bg-accent-mint/10 text-accent-mint",
      networking: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      cultural: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground";
  };

  const formatEventDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${time}`;
  };

  const isPast = (timestamp: number) => timestamp < Date.now();

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
            <h1 className="text-2xl font-bold">Campus Events</h1>
            <p className="text-sm text-muted-foreground">Discover and join events happening at GBC</p>
          </div>
          {isAuthenticated && (
            <Link
              href="/community/events/create"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Create Event
            </Link>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-none bg-white dark:bg-card py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none border border-gray-100 dark:border-border"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 hide-scrollbar">
          {timeFilters.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTime(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedTime === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 hide-scrollbar">
          {eventCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
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

        {events === undefined ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEvents.map((event) => (
              <Link
                key={event._id}
                href={`/community/events/${event._id}`}
                className={`block bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 hover:border-primary/30 transition-all ${isPast(event.date) ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  {isPast(event.date) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground">
                      Ended
                    </span>
                  )}
                  {event.maxAttendees && event.attendeeCount >= event.maxAttendees && !isPast(event.date) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      Full
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{event.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {event.description}
                </p>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {formatEventDate(event.date)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {event.attendeeCount}
                      {event.maxAttendees ? `/${event.maxAttendees}` : ""} going
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No events found</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Be the first to create an event!</p>
            {isAuthenticated && (
              <Link
                href="/community/events/create"
                className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Create an Event
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

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
