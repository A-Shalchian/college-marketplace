"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { FileText, ChevronLeft, Loader2 } from "lucide-react";

function TermsOfServiceContent() {
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
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Last updated: March 1, 2026
        </p>

        <div className="space-y-8">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using GBC Marketplace, you agree to be bound by
              these Terms of Service. This platform is exclusively for George
              Brown College students, faculty, and staff with valid
              @georgebrown.ca email addresses. If you do not agree to these
              terms, please do not use the platform.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">2. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be a current George Brown College student, faculty member,
              or staff member with an active @georgebrown.ca email address to
              register and use this platform. You must be at least 18 years of
              age. We reserve the right to verify your enrollment status at any
              time.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                You are responsible for maintaining the security of your account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                You must not share your account credentials with others
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                You are responsible for all activity that occurs under your account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                One account per person — duplicate accounts will be suspended
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">4. Listing Guidelines</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              When creating listings, you agree to:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Provide accurate descriptions and honest photos of your items
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Set fair prices and not engage in price manipulation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Not list prohibited items (weapons, drugs, stolen goods, counterfeit items, academic fraud services)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Mark listings as sold once the transaction is complete
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Not use the platform for commercial or business purposes
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">5. Transactions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GBC Marketplace is a platform that connects buyers and sellers. We
              do not process payments, handle shipping, or guarantee
              transactions. All exchanges are between individual users. We
              strongly recommend using designated exchange zones on campus and
              inspecting items before purchase. GBC Marketplace is not
              responsible for any disputes arising from transactions.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">6. Community Conduct</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Treat all users with respect and courtesy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Do not harass, bully, or threaten other users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Do not post spam, misleading content, or off-topic material
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Do not impersonate other users or misrepresent yourself
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                Report any violations to the admin team
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">7. Content Moderation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to remove any content that violates these
              terms or our community standards. Listings may be reviewed before
              becoming visible. Repeated violations may result in warnings,
              temporary suspensions, or permanent bans at the discretion of our
              admin team.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">8. Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect and use your information as necessary to operate the
              platform. Your @georgebrown.ca email is used for authentication.
              Profile information and listings are visible to other authenticated
              users. We do not sell your personal data to third parties. Messages
              between users are stored securely and accessible only to
              participants.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GBC Marketplace is provided &quot;as is&quot; without warranties of
              any kind. We are not liable for any damages resulting from your use
              of the platform, including but not limited to financial losses from
              transactions, disputes between users, or any harm resulting from
              in-person exchanges.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these terms from time to time. Continued use of the
              platform after changes are posted constitutes acceptance of the new
              terms. Significant changes will be communicated through the
              platform.
            </p>
          </section>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Questions about these terms? Reach out to our team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-3"
            >
              Contact Admin
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <TermsOfServiceContent />
    </Suspense>
  );
}
