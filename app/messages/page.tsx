"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import { User, Loader2, MessageCircle } from "lucide-react";

function MessagesContent() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const conversations = useQuery(
    api.messages.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (conversations === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {conversations && conversations.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {conversations.map((conv) => (
              <Link
                key={conv._id}
                href={`/messages/${conv._id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {conv.otherUser?.imageUrl ? (
                  <Image
                    src={conv.otherUser.imageUrl}
                    alt={conv.otherUser.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.otherUser?.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.listing?.title}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Start a conversation by contacting a seller
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
