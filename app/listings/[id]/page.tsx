"use client";

import { use, Suspense, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  ChevronRight,
  MessageSquare,
  Heart,
  Shield,
  User,
  Star,
  Calendar,
  Zap,
  MapPin,
  CheckCircle,
  Pencil,
  BadgeCheck,
} from "lucide-react";
import { useSaveListing } from "@/hooks/use-save-listing";

const campusMapUrls: Record<string, string> = {
  "St. James Campus": "https://maps.google.com/maps?q=George+Brown+College+St+James+Campus,Toronto&z=15&output=embed",
  "Casa Loma Campus": "https://maps.google.com/maps?q=George+Brown+College+Casa+Loma+Campus,Toronto&z=15&output=embed",
  "Waterfront Campus": "https://maps.google.com/maps?q=George+Brown+College+Waterfront+Campus,Toronto&z=15&output=embed",
};

function ListingContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const listing = useQuery(api.listings.getById, {
    listingId: id as Id<"listings">,
  });
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const existingConversation = useQuery(
    api.messages.getExistingConversation,
    currentUser && listing
      ? { listingId: id as Id<"listings">, buyerId: currentUser._id }
      : "skip"
  );
  const updateStatus = useMutation(api.listings.updateStatus);

  const { isSaved, isToggling, canSave, toggleSave } = useSaveListing({
    listingId: id as Id<"listings">,
    userId: currentUser?._id,
    sellerId: listing?.sellerId,
  });

  const handleContactSeller = () => {
    if (!listing || !currentUser || !listing.seller) return;

    // If conversation exists, go directly to it
    if (existingConversation) {
      router.push(`/messages/${existingConversation}`);
    } else {
      // Otherwise, go to new message page with listing info
      router.push(`/messages/new?listing=${listing._id}&seller=${listing.seller._id}`);
    }
  };

  if (listing === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500 text-lg">Listing not found</p>
          <Link
            href="/"
            className="text-primary hover:underline mt-4 inline-block font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?._id === listing.sellerId;
  const images = listing.imageUrls.length > 0 ? listing.imageUrls : [];
  const selectedImage = images[selectedImageIndex];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      textbooks: "Textbooks",
      electronics: "Electronics",
      furniture: "Furniture",
      clothing: "Clothing",
      supplies: "Study Supplies",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const sellerJoinDate = listing.seller?.createdAt
    ? new Date(listing.seller.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <nav className="flex items-center gap-2 mb-6 md:mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/?category=${listing.category}`} className="hover:text-primary transition-colors">
            {getCategoryLabel(listing.category)}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {listing.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              {selectedImage ? (
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: `url(${selectedImage})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg bg-cover bg-center cursor-pointer transition-all ${
                      selectedImageIndex === index
                        ? "border-2 border-primary ring-2 ring-primary/20"
                        : "border border-gray-100 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
                {images.length > 4 && (
                  <div className="aspect-square rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-bold text-gray-600">
                      +{images.length - 4} More
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 md:mt-10 p-6 md:p-8 rounded-xl bg-white border border-gray-100 shadow-sm">
              <h3 className="text-lg md:text-xl font-bold mb-4">Item Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Details
                  </span>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium">{getCategoryLabel(listing.category)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Condition</span>
                      <span className="font-medium">{listing.condition}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Posted</span>
                      <span className="font-medium">{getTimeAgo(listing.createdAt)}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Campus Logistics
                  </span>
                  <div className="mt-3 flex gap-2 items-start">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{listing.campus || "GBC Campus"}</p>
                      <p className="text-gray-500">Available for meetup at Student Centre</p>
                    </div>
                  </div>
                  {listing.campus && campusMapUrls[listing.campus] && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                      <iframe
                        src={campusMapUrls[listing.campus]}
                        width="100%"
                        height="150"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${listing.campus} Map`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              <div className="p-6 md:p-8 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                    {listing.condition}
                  </div>
                  {listing.status === "active" && (
                    <div className="px-3 py-1 rounded-full bg-accent-mint/10 text-accent-mint text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Available
                    </div>
                  )}
                  {listing.status === "sold" && (
                    <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                      Sold
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-2 tracking-tight">
                  {listing.title}
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  ${listing.price.toFixed(2)}
                </p>

                {!isOwner && listing.status === "active" && (
                  <div className="flex flex-col gap-3">
                    {user ? (
                      <button
                        onClick={handleContactSeller}
                        className="w-full py-3 md:py-4 bg-primary text-white rounded-xl font-bold text-base md:text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Message Seller
                      </button>
                    ) : (
                      <Link
                        href="/sign-in"
                        className="w-full py-3 md:py-4 bg-primary text-white rounded-xl font-bold text-base md:text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        Sign in to Message
                      </Link>
                    )}
                    <button
                      onClick={toggleSave}
                      disabled={isToggling || !canSave}
                      className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isSaved
                          ? "bg-red-50 text-red-500 border-2 border-red-200 hover:bg-red-100"
                          : "bg-gray-100 text-foreground hover:bg-gray-200"
                      } ${isToggling ? "opacity-70" : ""}`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                      {isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                    </button>
                  </div>
                )}

                {isOwner && (
                  <div className="flex flex-col gap-3">
                    {listing.status === "active" ? (
                      <>
                        <button
                          onClick={() =>
                            currentUser && updateStatus({ listingId: listing._id, status: "sold" })
                          }
                          className="w-full py-3 md:py-4 bg-accent-mint text-white rounded-xl font-bold hover:bg-accent-mint/90 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark as Sold
                        </button>
                        <Link
                          href={`/listings/${listing._id}/edit`}
                          className="w-full py-3 md:py-4 bg-gray-100 text-foreground rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-5 h-5" />
                          Edit Listing
                        </Link>
                      </>
                    ) : (
                      <div className="p-4 bg-accent-mint/10 rounded-xl text-center text-accent-mint font-bold">
                        This item has been sold
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Meet the Seller
                </h4>
                <div className="flex items-center gap-4 mb-4">
                  {listing.seller?.imageUrl ? (
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-cover bg-center border-4 border-white shadow-sm"
                      style={{ backgroundImage: `url(${listing.seller.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 dark:bg-primary/20 border-4 border-white shadow-sm flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-base md:text-lg font-bold">{listing.seller?.name}</h5>
                    <p className="text-sm text-gray-500">GBC Student</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">5.0</span>
                      <span className="text-xs text-gray-400">(New seller)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Member Since {sellerJoinDate}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-xs font-medium">
                    <Zap className="w-4 h-4 text-gray-400" />
                    Usually responds quickly
                  </div>
                </div>

                <Link
                  href="#"
                  className="block text-center text-sm font-bold text-primary hover:underline"
                >
                  View Profile
                </Link>
              </div>

              <div className="p-4 md:p-5 rounded-xl bg-primary/5 border border-primary/20 flex gap-4">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-primary">
                  <p className="font-bold mb-1 uppercase tracking-wider">Safety Tip</p>
                  Always meet in well-lit, public campus areas like the Student Centre.
                  GBC Safe Zones are recommended for all transactions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ListingContent id={id} />
    </Suspense>
  );
}
