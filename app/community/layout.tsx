import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | GBC Marketplace",
  description:
    "Connect with George Brown College students through forums, events, and clubs.",
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
