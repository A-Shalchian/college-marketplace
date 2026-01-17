"use client";

import { use, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, MessageCircle, User, Loader2, CheckCircle, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function ListingContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();

  const listing = useQuery(api.listings.getById, {
    listingId: id as Id<"listings">,
  });
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const getOrCreateConversation = useMutation(
    api.messages.getOrCreateConversation
  );
  const updateStatus = useMutation(api.listings.updateStatus);

  const handleContactSeller = async () => {
    if (!listing || !currentUser || !listing.seller) return;

    const conversationId = await getOrCreateConversation({
      listingId: listing._id,
      buyerId: currentUser._id,
      sellerId: listing.seller._id,
    });

    router.push(`/messages/${conversationId}`);
  };

  if (listing === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">Listing not found</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?._id === listing.sellerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-square relative bg-gray-100">
              {listing.imageUrls[0] ? (
                <Image
                  src={listing.imageUrls[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md mb-2">
                    {listing.condition}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {listing.title}
                  </h1>
                </div>
              </div>

              <p className="text-3xl font-bold text-blue-600 mt-4">
                ${listing.price.toFixed(2)}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="font-medium text-gray-900 mb-3">Seller</h2>
                <div className="flex items-center gap-3">
                  {listing.seller?.imageUrl ? (
                    <Image
                      src={listing.seller.imageUrl}
                      alt={listing.seller.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.seller?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {listing.seller?.email}
                    </p>
                  </div>
                </div>
              </div>

              {!isOwner && user && (
                <button
                  onClick={handleContactSeller}
                  className="w-full mt-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contact Seller
                </button>
              )}

              {!user && (
                <p className="mt-6 text-center text-gray-500">
                  <Link href="/sign-in" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>{" "}
                  to contact the seller
                </p>
              )}

              {isOwner && (
                <div className="mt-6 space-y-3">
                  {listing.status === "active" ? (
                    <>
                      <button
                        onClick={() =>
                          updateStatus({ listingId: listing._id, status: "sold" })
                        }
                        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Mark as Sold
                      </button>
                      <Link
                        href={`/listings/${listing._id}/edit`}
                        className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Pencil className="h-5 w-5" />
                        Edit Listing
                      </Link>
                    </>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg text-center text-green-700 font-medium">
                      This item has been sold
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ListingPage({
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
      <ListingContent id={id} />
    </Suspense>
  );
}
