"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import {
  Store,
  Search,
  PlusCircle,
  User,
  Menu,
  X,
  Home,
  MessageCircle,
  LogOut,
  ChevronDown,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useClerk();
  const currentUser = useQuery(api.users.getCurrentUser);
  const unreadCount = useQuery(
    api.messages.getUnreadCount,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    setAvatarMenuOpen(false);
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-border">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="bg-foreground p-2 rounded-lg text-background">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            GBC<span className="text-muted-foreground">Market</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl relative hidden md:block"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, electronics, furniture..."
            className="w-full h-12 pl-12 pr-4 bg-gray-100 dark:bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
          />
        </form>

        <div className="flex items-center gap-6">
          {!isLoading && isAuthenticated ? (
            <>
              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  href="/profile#listings"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Listings
                </Link>
                <Link
                  href="/community"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors relative"
                >
                  Messages
                  {unreadCount !== undefined && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-4 min-w-[18px] h-[18px] flex items-center justify-center bg-accent-coral text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </nav>
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-border hidden lg:block" />
              <Link
                href="/sell"
                className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
              >
                <PlusCircle className="w-[18px] h-[18px]" />
                <span>Post Item</span>
              </Link>

              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center gap-1.5 group"
                >
                  <div className="relative">
                    {currentUser?.imageUrl ? (
                      <img
                        src={currentUser.imageUrl}
                        alt={currentUser.name || "User"}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-card object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-card bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {userInitial}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-foreground border-2 border-white dark:border-card rounded-full" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors hidden lg:block" />
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-border">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {currentUser?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUser?.email || ""}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : isLoading ? null : (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-background border-b border-gray-100 dark:border-border">
          <div className="px-6 py-4 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, electronics, furniture..."
                className="w-full h-12 pl-12 pr-4 bg-gray-100 dark:bg-muted border-none rounded-xl focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
              />
            </form>

            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>

              {!isLoading && isAuthenticated ? (
                <>
                  <Link
                    href="/sell"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-medium">Post Item</span>
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Messages</span>
                    {unreadCount !== undefined && unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-accent-coral text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/community"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Community</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/profile#listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                  >
                    <Store className="w-5 h-5" />
                    <span className="font-medium">My Listings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="px-4 py-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
