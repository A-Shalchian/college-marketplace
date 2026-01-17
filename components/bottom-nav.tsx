"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface BottomNavProps {
  onSearchClick?: () => void;
}

export function BottomNav({ onSearchClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const isActive = (path: string) => pathname === path;

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      router.push("/?search=open");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-16 h-full ${
            isActive("/") ? "text-primary" : "text-gray-400"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>

        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center w-16 h-full text-gray-400"
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Search</span>
        </button>

        <Link
          href={isSignedIn ? "/sell" : "/sign-in"}
          className="flex items-center justify-center -mt-5"
        >
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <PlusCircle className="w-7 h-7 text-white" />
          </div>
        </Link>

        <Link
          href={isSignedIn ? "/messages" : "/sign-in"}
          className={`flex flex-col items-center justify-center w-16 h-full ${
            pathname.startsWith("/messages") ? "text-primary" : "text-gray-400"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Messages</span>
        </Link>

        <Link
          href={isSignedIn ? "/profile" : "/sign-in"}
          className={`flex flex-col items-center justify-center w-16 h-full ${
            isActive("/profile") ? "text-primary" : "text-gray-400"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
