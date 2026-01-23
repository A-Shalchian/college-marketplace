"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Shield,
  Image as ImageIcon,
} from "lucide-react";

function NewConversationContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listingId = searchParams.get("listing") as Id<"listings"> | null;
  const sellerId = searchParams.get("seller") as Id<"users"> | null;

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });

  const listing = useQuery(
    api.listings.getById,
    listingId ? { listingId } : "skip"
  );

  const seller = useQuery(
    api.users.getUserById,
    sellerId ? { userId: sellerId } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);

  // If user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Please sign in to send messages</p>
          <Link
            href="/sign-in"
            className="text-primary hover:underline mt-4 block font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If missing required params
  if (!listingId || !sellerId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Invalid message request</p>
          <Link
            href="/"
            className="text-primary hover:underline mt-4 block font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (listing === undefined || seller === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If listing not found
  if (!listing || !seller) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Listing not found</p>
          <Link
            href="/"
            className="text-primary hover:underline mt-4 block font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || isSending) return;

    setIsSending(true);
    try {
      // This will create the conversation and send the message
      const result = await sendMessage({
        listingId,
        buyerId: currentUser._id,
        sellerId,
        senderId: currentUser._id,
        content: message.trim(),
      });

      // Navigate to the actual conversation page
      router.replace(`/messages/${result.conversationId}`);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <section className="flex flex-1 flex-col bg-white relative">
          <header className="flex items-center justify-between border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm z-10">
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href={`/listings/${listingId}`}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              {listing.imageUrls?.[0] ? (
                <div
                  className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url(${listing.imageUrls[0]})` }}
                />
              ) : (
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold truncate max-w-[150px] md:max-w-none">
                    {listing.title}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-semibold">
                  ${listing.price.toFixed(2)}
                  <span className="mx-1 text-gray-300">|</span>
                  <Link
                    href={`/listings/${listingId}`}
                    className="text-primary hover:underline"
                  >
                    View Listing
                  </Link>
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="flex justify-center mb-4">
                {seller.imageUrl ? (
                  <div
                    className="w-16 h-16 rounded-full bg-cover bg-center border-4 border-white shadow-lg"
                    style={{ backgroundImage: `url(${seller.imageUrl})` }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-white shadow-lg flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">{seller.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Send a message to start the conversation
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Meet in public campus spots for safety</span>
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 md:p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSend}>
              <div className="flex items-center gap-2 md:gap-3 bg-background p-2 rounded-2xl border-2 border-transparent focus-within:border-primary/30 transition-all">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className="bg-primary text-white p-2.5 rounded-xl flex items-center justify-center hover:bg-primary/90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function NewConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewConversationContent />
    </Suspense>
  );
}
