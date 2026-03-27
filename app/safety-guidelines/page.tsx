"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Shield,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Users,
  Eye,
  Ban,
  ChevronLeft,
  Loader2,
} from "lucide-react";

function SafetyGuidelinesContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Safety Guidelines</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Your safety is our top priority. Follow these guidelines to have a
          secure buying and selling experience on campus.
        </p>

        <div className="space-y-8">
          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                Meet in Designated Exchange Zones
              </h2>
            </div>
            <p className="text-muted-foreground mb-3">
              Always conduct exchanges in our designated safe zones on campus.
              These areas are well-lit, have security cameras, and are in
              high-traffic locations.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">St. James Campus</strong>{" "}
                  — Student Centre, Main Lobby (341 King St E)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">Casa Loma Campus</strong>{" "}
                  — Building E Lobby (146 Kendal Ave)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>
                  <strong className="text-foreground">
                    Waterfront Campus
                  </strong>{" "}
                  — Main Atrium (51 Dockside Dr)
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                Communicate Through the Platform
              </h2>
            </div>
            <p className="text-muted-foreground">
              Keep all conversations within GBC Marketplace messaging. This
              creates a record of your interactions and protects both parties. Do
              not share personal phone numbers, social media, or email addresses
              until you&apos;re comfortable.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                Inspect Before You Buy
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Thoroughly inspect items in person before completing a purchase
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Test electronics to make sure they work properly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Compare the item to the listing photos and description
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                If something feels off, trust your instincts and walk away
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Avoid Scams</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Never send payment before meeting and inspecting the item
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Be wary of prices that seem too good to be true
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Use cash or secure payment methods — avoid wire transfers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Report suspicious listings or users immediately
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Bring a Friend</h2>
            </div>
            <p className="text-muted-foreground">
              For high-value transactions, consider bringing a friend along.
              There&apos;s safety in numbers, and an extra set of eyes can help
              you make better decisions about your purchase.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Prohibited Items</h2>
            </div>
            <p className="text-muted-foreground mb-3">
              The following items are not permitted on GBC Marketplace:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>• Weapons or firearms</span>
              <span>• Alcohol or drugs</span>
              <span>• Stolen goods</span>
              <span>• Counterfeit items</span>
              <span>• Tobacco products</span>
              <span>• Hazardous materials</span>
              <span>• Academic fraud services</span>
              <span>• Adult content</span>
            </div>
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              See something suspicious? Don&apos;t hesitate to report it.
            </p>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report a Listing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SafetyGuidelinesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SafetyGuidelinesContent />
    </Suspense>
  );
}
