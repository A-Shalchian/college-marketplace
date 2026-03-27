"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Camera,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const zones = [
  {
    campus: "St. James Campus",
    address: "341 King Street East",
    location: "Student Centre — Main Lobby",
    hours: "Mon–Fri 7:00 AM – 10:00 PM, Sat 8:00 AM – 5:00 PM",
    features: ["Security cameras", "High foot traffic", "Well-lit area", "Near security desk"],
  },
  {
    campus: "Casa Loma Campus",
    address: "146 Kendal Avenue",
    location: "Building E — Main Lobby",
    hours: "Mon–Fri 7:00 AM – 10:00 PM, Sat 8:00 AM – 5:00 PM",
    features: ["Security cameras", "Staff nearby", "Well-lit area", "Indoor location"],
  },
  {
    campus: "Waterfront Campus",
    address: "51 Dockside Drive",
    location: "Main Atrium — Ground Floor",
    hours: "Mon–Fri 7:00 AM – 10:00 PM, Sat 8:00 AM – 5:00 PM",
    features: ["Security cameras", "Reception desk nearby", "Well-lit area", "High visibility"],
  },
];

function ExchangeZonesContent() {
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
          <MapPin className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Exchange Zones</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Designated safe meeting spots on campus for completing your
          transactions. Always meet in these locations for your safety.
        </p>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            All exchange zones are monitored by campus security cameras and
            located in high-traffic areas. We strongly recommend completing all
            transactions during posted hours.
          </p>
        </div>

        <div className="space-y-6">
          {zones.map((zone) => (
            <div
              key={zone.campus}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-1">{zone.campus}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {zone.address}
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Meeting Point</p>
                    <p className="text-sm text-muted-foreground">
                      {zone.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Recommended Hours</p>
                    <p className="text-sm text-muted-foreground">
                      {zone.hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Camera className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Safety Features</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {zone.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Tips for Safe Exchanges</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">1.</span>
              Always meet during recommended hours when the campus is busy
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">2.</span>
              Let a friend know where you&apos;re going and who you&apos;re meeting
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">3.</span>
              Inspect the item thoroughly before completing the exchange
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">4.</span>
              Use cash or a secure payment method — count your change
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">5.</span>
              If the other person doesn&apos;t show up, don&apos;t wait around — reschedule
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ExchangeZonesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ExchangeZonesContent />
    </Suspense>
  );
}
