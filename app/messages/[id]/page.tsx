"use client";

import { use, useState, useRef, useEffect, Suspense } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Search,
  Filter,
  Shield,
  MessageSquare,
  Calendar,
  PlusCircle,
  Image as ImageIcon,
  CheckCheck,
  X,
} from "lucide-react";

function ConversationContent({ id }: { id: string }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(api.users.getCurrentUser);
  const conversation = useQuery(
    api.messages.getConversationById,
    currentUser ? { conversationId: id as Id<"conversations">, userId: currentUser._id } : "skip"
  );
  const messages = useQuery(
    api.messages.getMessages,
    currentUser ? { conversationId: id as Id<"conversations">, userId: currentUser._id } : "skip"
  );
  const conversations = useQuery(
    api.messages.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const updateStatus = useMutation(api.listings.updateStatus);

  const handleMarkAsSold = async () => {
    if (!conversation?.listing?._id || !currentUser) return;
    await updateStatus({
      listingId: conversation.listing._id as Id<"listings">,
      status: "sold",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentUser && conversation) {
      markAsRead({
        conversationId: id as Id<"conversations">,
        userId: currentUser._id,
      });
    }
  }, [currentUser, conversation, messages?.length]);

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Conversation not found</p>
          <Link
            href="/messages"
            className="text-primary hover:underline mt-4 block font-semibold"
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

  const isSeller = currentUser?._id === conversation.sellerId;

  const formatMessageTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDayHeader = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { weekday: "long", hour: "2-digit", minute: "2-digit" });
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <aside className="hidden md:flex w-80 flex-col border-r border-gray-200 bg-white shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Conversations</h1>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full rounded-xl border-none bg-background py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold whitespace-nowrap">
                All
              </button>
              <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-200 transition-colors">
                Buying
              </button>
              <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-200 transition-colors">
                Selling
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {conversations?.map((conv) => {
              const isActive = conv._id === id;
              return (
                <Link
                  key={conv._id}
                  href={`/messages/${conv._id}`}
                  className={`group relative flex items-center gap-4 px-3 py-4 rounded-2xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-primary/5 border-l-4 border-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    {conv.otherUser?.imageUrl ? (
                      <div
                        className="h-14 w-14 shrink-0 rounded-full bg-cover bg-center border-2 border-white"
                        style={{ backgroundImage: `url(${conv.otherUser.imageUrl})` }}
                      />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-white flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-accent-mint" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.hasUnread ? "font-extrabold" : "font-bold"}`}>
                        {conv.otherUser?.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {conv.hasUnread && !isActive && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-coral shrink-0" />
                        )}
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs font-semibold truncate mb-1 ${isActive ? "text-primary" : "text-gray-500"}`}>
                      {conv.listing?.title}
                    </p>
                    {conv.lastMessage && (
                      <p className={`text-xs truncate ${conv.hasUnread && !isActive ? "text-foreground font-semibold" : "text-gray-500"}`}>
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-100 bg-background/50">
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <Shield className="w-4 h-4" />
              <span>Meet in public campus spots.</span>
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col bg-white relative">
          <header className="flex items-center justify-between border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm z-10">
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/messages"
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              {conversation.listing?.imageUrls?.[0] ? (
                <div
                  className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url(${conversation.listing.imageUrls[0]})` }}
                />
              ) : (
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold truncate max-w-[150px] md:max-w-none">
                    {conversation.listing?.title}
                  </h3>
                  {conversation.listing?.status === "active" && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 bg-accent-mint/20 text-accent-mint text-[10px] font-bold uppercase tracking-wide rounded">
                      Available
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-semibold">
                  ${conversation.listing?.price?.toFixed(2)}
                  <span className="mx-1 text-gray-300">|</span>
                  <Link
                    href={`/listings/${conversation.listingId}`}
                    className="text-primary hover:underline"
                  >
                    View Listing
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4" />
                Set Meeting
              </button>
              {isSeller && conversation.listing?.status === "active" && (
                <button
                  onClick={handleMarkAsSold}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Mark as Sold
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length > 0 && (
              <div className="flex justify-center">
                <span className="px-4 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {formatDayHeader(messages[0].createdAt)}
                </span>
              </div>
            )}

            {messages.map((msg, index) => {
              const isOwn = msg.senderId === currentUser?._id;
              const sender = isOwn ? currentUser : otherUser;

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-3 max-w-[85%] md:max-w-[80%] ${
                    isOwn ? "flex-row-reverse ml-auto" : ""
                  }`}
                >
                  {!isOwn && (
                    <div
                      className="h-8 w-8 rounded-full bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage: sender?.imageUrl
                          ? `url(${sender.imageUrl})`
                          : undefined,
                        backgroundColor: sender?.imageUrl ? undefined : "#e5e7eb",
                      }}
                    >
                      {!sender?.imageUrl && (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`space-y-1 ${isOwn ? "items-end flex flex-col" : ""}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isOwn
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                      {isOwn && (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      )}
                      <p className="text-[10px] text-gray-400">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {showSafetyTip && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-10">
              <div className="bg-white/90 backdrop-blur-md border border-primary/20 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="h-10 w-10 bg-accent-mint/20 text-accent-mint flex items-center justify-center rounded-xl shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">Safety Reminder</p>
                  <p className="text-[11px] text-gray-500">
                    Meet in designated &quot;Safe Exchange Zones&quot; on campus. Avoid e-transfers before seeing the item.
                  </p>
                </div>
                <button
                  onClick={() => setShowSafetyTip(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 md:p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSend}>
              <div className="flex items-center gap-2 md:gap-3 bg-background p-2 rounded-2xl border-2 border-transparent focus-within:border-primary/30 transition-all">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-primary text-white p-2.5 rounded-xl flex items-center justify-center hover:bg-primary/90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </form>
          </div>
        </section>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConversationContent id={id} />
    </Suspense>
  );
}
