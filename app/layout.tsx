import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebsiteJsonLd } from "./json-ld";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gbc-marketplace.xyz"),
  title: {
    default: "GBC Marketplace | Campus Buy & Sell",
    template: "%s | GBC Marketplace",
  },
  description: "Buy and sell with fellow George Brown College students",
  openGraph: {
    type: "website",
    siteName: "GBC Marketplace",
    title: "GBC Marketplace | Campus Buy & Sell",
    description: "Buy and sell with fellow George Brown College students",
    url: "https://gbc-marketplace.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "GBC Marketplace | Campus Buy & Sell",
    description: "Buy and sell with fellow George Brown College students",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased`}>
        <WebsiteJsonLd />
        <ClerkProvider
          localization={{
            signIn: {
              start: {
                subtitle: "Enter your @georgebrown.ca email to continue",
              },
            },
            signUp: {
              start: {
                subtitle:
                  "Use your @georgebrown.ca email to create an account",
              },
            },
          }}
        >
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
