"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useSaveListing } from "@/hooks/use-save-listing";

interface ListingCardProps {
  id: Id<"listings">;
  title: string;
  price: number;
  images: string[];
  condition: string;
  sellerName?: string;
  sellerImage?: string;
  sellerId?: Id<"users">;
  currentUserId?: Id<"users"> | null;
  createdAt: number;
}

export function ListingCard({
  id,
  title,
  price,
  images,
  condition,
  sellerName,
  sellerImage,
  sellerId,
  currentUserId,
  createdAt,
}: ListingCardProps) {
  const timeAgo = getTimeAgo(createdAt);
  const conditionStyle = getConditionStyle(condition);
  const { isSaved, isToggling, canSave, toggleSave } = useSaveListing({
    listingId: id,
    userId: currentUserId ?? undefined,
    sellerId,
  });

  return (
    <Link href={`/listings/${id}`}>
      <div className="subtle-float bg-white dark:bg-card rounded-xl overflow-hidden group border border-transparent dark:border-border">
        <div className="relative aspect-square">
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
              ${price}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canSave) toggleSave();
              }}
              disabled={isToggling || !canSave}
              className={`bg-white/80 dark:bg-card/80 backdrop-blur-sm w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                !canSave
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : isToggling
                    ? "opacity-70 text-gray-600"
                    : "hover:text-red-500"
              } ${isSaved ? "text-red-500" : "text-gray-600 dark:text-muted-foreground"}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
          {images[0] ? (
            <img
              src={images[0]}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-muted flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute bottom-3 left-3 z-10">
            <span className={`backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded uppercase ${conditionStyle}`}>
              {condition}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground line-clamp-1 mb-3">{title}</h3>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-border">
            <div className="flex items-center gap-2">
              {sellerImage ? (
                <div
                  className="w-6 h-6 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${sellerImage})` }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20" />
              )}
              <span className="text-xs text-muted-foreground font-medium">{sellerName}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getConditionStyle(condition: string): string {
  const lower = condition.toLowerCase();
  if (lower.includes("new") || lower.includes("mint") || lower.includes("like new")) {
    return "bg-emerald-500/90 text-white";
  }
  if (lower.includes("good")) {
    return "bg-amber-500/90 text-white";
  }
  if (lower.includes("fair")) {
    return "bg-orange-500/90 text-white";
  }
  return "bg-white/90 text-foreground";
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
