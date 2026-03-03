import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GBC Marketplace | Campus Buy & Sell",
  description: "Buy and sell with fellow George Brown College students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#28618a",
        },
      }}
      localization={{
        signIn: {
          start: {
            subtitle: "Enter your @georgebrown.ca email to continue",
          },
        },
        signUp: {
          start: {
            subtitle: "Use your @georgebrown.ca email to create an account",
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${jakarta.variable} antialiased`}>
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
