import type { Metadata } from "next";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ListingContent } from "./listing-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const listing = await fetchQuery(api.listings.getById, {
      listingId: id as Id<"listings">,
    });

    if (!listing) {
      return {
        title: "Listing Not Found",
        description: "This listing could not be found on GBC Marketplace.",
      };
    }

    const description = listing.description
      ? listing.description.slice(0, 160)
      : `${listing.title} - $${listing.price.toFixed(2)} on GBC Marketplace`;

    return {
      title: listing.title,
      description,
      openGraph: {
        title: `${listing.title} - $${listing.price.toFixed(2)}`,
        description,
        type: "website",
        url: `https://gbc-marketplace.xyz/listings/${id}`,
        ...(listing.imageUrls[0] && {
          images: [{ url: listing.imageUrls[0] }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${listing.title} - $${listing.price.toFixed(2)}`,
        description,
        ...(listing.imageUrls[0] && { images: [listing.imageUrls[0]] }),
      },
    };
  } catch {
    return {
      title: "Listing",
      description: "View this listing on GBC Marketplace.",
    };
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preloadedListing = await preloadQuery(api.listings.getById, {
    listingId: id as Id<"listings">,
  });

  const listing = await fetchQuery(api.listings.getById, {
    listingId: id as Id<"listings">,
  });

  return (
    <>
      {listing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: listing.title,
              description: listing.description,
              image: listing.imageUrls[0] || undefined,
              offers: {
                "@type": "Offer",
                price: listing.price.toFixed(2),
                priceCurrency: "CAD",
                availability:
                  listing.status === "active"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
                itemCondition:
                  listing.condition === "New"
                    ? "https://schema.org/NewCondition"
                    : "https://schema.org/UsedCondition",
              },
            }),
          }}
        />
      )}
      <ListingContent preloadedListing={preloadedListing} />
    </>
  );
}
