"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Store, Search, PlusCircle, User } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0f1419] backdrop-blur-md border-b border-gray-100 dark:border-border">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">
            GBC<span className="text-foreground">Market</span>
          </h1>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
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
          {isLoaded && isSignedIn ? (
            <>
              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  href="/profile#listings"
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  My Listings
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  Messages
                </Link>
              </nav>
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-border hidden lg:block" />
              <Link
                href="/sell"
                className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <PlusCircle className="w-[18px] h-[18px]" />
                <span>Post Item</span>
              </Link>
              <div className="relative">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 rounded-full border-2 border-white dark:border-card",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Dashboard"
                      labelIcon={<User className="w-4 h-4" />}
                      href="/profile"
                    />
                  </UserButton.MenuItems>
                </UserButton>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent-mint border-2 border-white dark:border-card rounded-full" />
              </div>
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
