"use client";

import { Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { ListingCard } from "@/components/listing-card";
import Image from "next/image";
import { User, Loader2, Package, Trash2, CheckCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

function ProfileContent() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const myListings = useQuery(
    api.listings.getByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const deleteListing = useMutation(api.listings.deleteListing);
  const updateStatus = useMutation(api.listings.updateStatus);

  const handleDelete = async (listingId: Id<"listings">) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteListing({ listingId });
    }
  };

  const handleMarkAsSold = async (listingId: Id<"listings">) => {
    await updateStatus({ listingId, status: "sold" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (currentUser === undefined || myListings === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const activeListings = myListings?.filter((l) => l.status === "active") ?? [];
  const soldListings = myListings?.filter((l) => l.status === "sold") ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.fullName}
              </h1>
              <p className="text-gray-600">
                {user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Member since{" "}
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString()
                  : "recently"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Active Listings ({activeListings.length})
            </h2>
          </div>

          {activeListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activeListings.map((listing) => (
                <div key={listing._id} className="relative group">
                  <ListingCard
                    id={listing._id}
                    title={listing.title}
                    price={listing.price}
                    images={listing.imageUrls}
                    condition={listing.condition}
                    createdAt={listing.createdAt}
                  />
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleMarkAsSold(listing._id);
                      }}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      title="Mark as sold"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(listing._id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active listings</p>
            </div>
          )}
        </div>

        {soldListings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sold Items ({soldListings.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-60">
              {soldListings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  id={listing._id}
                  title={listing.title}
                  price={listing.price}
                  images={listing.imageUrls}
                  condition={listing.condition}
                  createdAt={listing.createdAt}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
