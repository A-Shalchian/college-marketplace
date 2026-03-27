"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Camera,
  X,
} from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: "social", label: "Social" },
  { id: "academic", label: "Academic" },
  { id: "sports", label: "Sports" },
  { id: "workshop", label: "Workshop" },
  { id: "networking", label: "Networking" },
  { id: "cultural", label: "Cultural" },
];

const campuses = [
  { id: "St. James Campus", label: "St. James Campus" },
  { id: "Casa Loma Campus", label: "Casa Loma Campus" },
  { id: "Waterfront Campus", label: "Waterfront Campus" },
];

function CreateEventContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createEvent = useMutation(api.events.createEvent);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("social");
  const [campus, setCampus] = useState("St. James Campus");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Only JPEG, PNG, and WebP images"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setError("");

    if (title.trim().length < 3) {
      setError("Event title must be at least 3 characters");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }
    if (location.trim().length < 2) {
      setError("Location must be at least 2 characters");
      return;
    }
    if (!date || !time) {
      setError("Please select a date and time");
      return;
    }

    const startTimestamp = new Date(`${date}T${time}`).getTime();
    if (isNaN(startTimestamp) || startTimestamp < Date.now()) {
      setError("Event date must be in the future");
      return;
    }

    let endTimestamp: number | undefined;
    if (endDate && endTime) {
      endTimestamp = new Date(`${endDate}T${endTime}`).getTime();
      if (isNaN(endTimestamp) || endTimestamp <= startTimestamp) {
        setError("End date must be after the start date");
        return;
      }
    }

    const maxAttendeesNum = maxAttendees ? parseInt(maxAttendees, 10) : undefined;
    if (maxAttendeesNum !== undefined && (isNaN(maxAttendeesNum) || maxAttendeesNum < 1)) {
      setError("Max attendees must be at least 1");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageId: string | undefined;
      if (imageFile && currentUser) {
        const uploadUrl = await generateUploadUrl({ userId: currentUser._id });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        const { storageId } = await result.json();
        imageId = storageId;
      }

      const eventId = await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category,
        campus,
        date: startTimestamp,
        endDate: endTimestamp,
        maxAttendees: maxAttendeesNum,
        ...(imageId ? { imageId } : {}),
      });
      toast.success("Event created!");
      router.push(`/community/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to create an event</p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
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
            href="/community/events"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create an Event</h1>
            <p className="text-sm text-muted-foreground">Organize a campus event at GBC</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GBC Hackathon 2026"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{title.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this event about? Include any important details."
                rows={5}
                maxLength={5000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/5,000</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Event Image <span className="font-normal text-muted-foreground">(optional)</span></label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-32 w-full max-w-[300px] object-cover rounded-xl border border-gray-200" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-accent-coral text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm text-muted-foreground w-full"
                >
                  <Camera className="w-5 h-5" />
                  Add a cover image
                </button>
              )}
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 340, Building A"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Start Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Start Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">End Date <span className="font-normal text-muted-foreground">(optional)</span></label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">End Time <span className="font-normal text-muted-foreground">(optional)</span></label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Max Attendees <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                placeholder="Leave empty for unlimited"
                min={1}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <Link
              href="/community/events"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !location.trim() || !date || !time}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreateEventContent />
    </Suspense>
  );
}
