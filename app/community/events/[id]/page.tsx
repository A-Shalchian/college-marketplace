"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Trash2,
  LogOut,
  Shield,
  CheckCircle2,
} from "lucide-react";

function EventDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const eventId = params.id as Id<"events">;

  const event = useQuery(api.events.getEventById, { eventId });
  const attendees = useQuery(api.events.getEventAttendees, { eventId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const attendance = useQuery(
    api.events.isAttending,
    isAuthenticated ? { eventId } : "skip"
  );

  const rsvpEvent = useMutation(api.events.rsvpEvent);
  const cancelRsvp = useMutation(api.events.cancelRsvp);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const [isRsvping, setIsRsvping] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Link
            href="/community/events"
            className="inline-block mt-4 text-primary font-semibold hover:underline"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isOrganizer = currentUser && event.organizerId === currentUser._id;
  const isSiteAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const canDelete = isOrganizer || isSiteAdmin;
  const isAttending = !!attendance;
  const isPast = event.date < Date.now();
  const isFull = event.maxAttendees ? event.attendeeCount >= event.maxAttendees : false;
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendeeCount : null;

  const handleRsvp = async () => {
    setIsRsvping(true);
    try {
      await rsvpEvent({ eventId });
    } catch (err) {
      console.error(err);
    }
    setIsRsvping(false);
  };

  const handleCancelRsvp = async () => {
    setIsCancelling(true);
    try {
      await cancelRsvp({ eventId });
    } catch (err) {
      console.error(err);
    }
    setIsCancelling(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent({ eventId });
      router.push("/community/events");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

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

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <Link
          href="/community/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                {isPast && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground">
                    Ended
                  </span>
                )}
                {isFull && !isPast && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    Full
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{event.description}</p>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {formatFullDate(event.date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  {formatTime(event.date)}
                  {event.endDate && ` – ${formatTime(event.endDate)}`}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" /> {event.location} · {event.campus}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  {event.attendeeCount} going
                  {event.maxAttendees && ` · ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                </span>
              </div>

              {event.organizer && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-border">
                  {event.organizer.imageUrl ? (
                    <div
                      className="w-7 h-7 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${event.organizer.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Organized by <span className="font-bold text-foreground">{event.organizer.name}</span>
                  </span>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="flex flex-col gap-2 shrink-0">
                {!isPast && (
                  <>
                    {!isAttending ? (
                      <button
                        onClick={handleRsvp}
                        disabled={isRsvping || isFull}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {isRsvping ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {isFull ? "Full" : "RSVP"}
                      </button>
                    ) : !isOrganizer ? (
                      <button
                        onClick={handleCancelRsvp}
                        disabled={isCancelling}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-muted text-gray-700 dark:text-muted-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-border transition-all disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        Cancel RSVP
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-primary px-5 py-2.5 rounded-xl font-bold text-sm bg-primary/10">
                        <Shield className="w-4 h-4" /> Organizer
                      </span>
                    )}
                  </>
                )}
                {canDelete && (
                  <>
                    {showDeleteConfirm ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-xl font-bold text-xs hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-2 rounded-xl font-bold text-xs bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-border transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6">
          <h2 className="font-bold text-lg mb-4">
            Attendees ({event.attendeeCount})
          </h2>
          {attendees === undefined ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : attendees.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attendees.map((attendee) => (
                <div
                  key={attendee._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-muted/50"
                >
                  {attendee.user?.imageUrl ? (
                    <div
                      className="w-9 h-9 rounded-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${attendee.user.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{attendee.user?.name || "Unknown"}</p>
                    {attendee.userId === event.organizerId && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary">
                        <Shield className="w-3 h-3" /> Organizer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendees yet</p>
          )}
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}
