"use client";

import Link from "next/link";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

interface ListingCardProps {
  id: Id<"listings">;
  title: string;
  price: number;
  images: string[];
  condition: string;
  sellerName?: string;
  createdAt: number;
}

export function ListingCard({
  id,
  title,
  price,
  images,
  condition,
  sellerName,
  createdAt,
}: ListingCardProps) {
  const timeAgo = getTimeAgo(createdAt);

  return (
    <Link href={`/listings/${id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative bg-gray-100">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-md text-xs font-medium text-gray-700">
            {condition}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          <p className="text-lg font-bold text-blue-600 mt-1">
            ${price.toFixed(2)}
          </p>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{sellerName}</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
