"use client";

import { use, useState, useRef, useEffect, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Send, User, Loader2 } from "lucide-react";

function ConversationContent({ id }: { id: string }) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const conversation = useQuery(api.messages.getConversationById, {
    conversationId: id as Id<"conversations">,
  });
  const messages = useQuery(api.messages.getMessages, {
    conversationId: id as Id<"conversations">,
  });
  const sendMessage = useMutation(api.messages.sendMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    await sendMessage({
      conversationId: id as Id<"conversations">,
      senderId: currentUser._id,
      content: message.trim(),
    });

    setMessage("");
  };

  if (conversation === undefined || messages === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Conversation not found</p>
          <Link
            href="/messages"
            className="text-blue-600 hover:underline mt-4 block"
          >
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  const otherUser =
    currentUser?._id === conversation.buyerId
      ? conversation.seller
      : conversation.buyer;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/messages"
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>

            {otherUser?.imageUrl ? (
              <Image
                src={otherUser.imageUrl}
                alt={otherUser.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}

            <div className="flex-1">
              <p className="font-medium text-gray-900">{otherUser?.name}</p>
              <Link
                href={`/listings/${conversation.listingId}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {conversation.listing?.title}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === currentUser?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="bg-white border-t border-gray-200 p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ConversationContent id={id} />
    </Suspense>
  );
}
