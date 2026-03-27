"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  HelpCircle,
  ShoppingBag,
  Tag,
  MessageCircle,
  Shield,
  User,
  ChevronLeft,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const faqSections = [
  {
    title: "Buying",
    icon: ShoppingBag,
    questions: [
      {
        q: "How do I buy an item?",
        a: 'Browse listings on the homepage, click on an item you\'re interested in, and use the "Message Seller" button to arrange a meetup. All transactions happen in person at our designated exchange zones.',
      },
      {
        q: "How do I know if a listing is legitimate?",
        a: "All users are verified George Brown College students. Check the seller's profile, read the item description carefully, and always inspect items in person before purchasing. If something seems off, report the listing.",
      },
      {
        q: "Can I negotiate the price?",
        a: "Yes! Use the messaging system to discuss pricing with the seller. Many sellers are open to reasonable offers.",
      },
      {
        q: "What payment methods should I use?",
        a: "We recommend cash or e-transfer for in-person transactions. Avoid wire transfers or sending payment before meeting. GBC Marketplace does not process payments directly.",
      },
    ],
  },
  {
    title: "Selling",
    icon: Tag,
    questions: [
      {
        q: "How do I create a listing?",
        a: 'Click the "Sell" button in the navigation bar. Fill in the details including title, description, price, category, condition, and upload photos. Your listing will be visible after moderation review.',
      },
      {
        q: "How many photos can I upload?",
        a: "You can upload up to 10 photos per listing. We recommend including multiple angles and close-ups of any wear or damage for transparency.",
      },
      {
        q: "How do I edit or delete my listing?",
        a: 'Go to your listing page and click the edit button. You can update any details or mark the item as sold. To delete, use the delete option on the edit page.',
      },
      {
        q: "Why was my listing flagged or removed?",
        a: "Listings may be flagged if they contain prohibited items, inappropriate content, or misleading information. Check the Terms of Service for guidelines. Contact admin if you believe a removal was an error.",
      },
    ],
  },
  {
    title: "Messaging",
    icon: MessageCircle,
    questions: [
      {
        q: "How do I message a seller?",
        a: 'Open a listing and click "Message Seller." This will create a conversation linked to that specific listing.',
      },
      {
        q: "Can I see my message history?",
        a: 'Yes, all your conversations are available in the Messages section, accessible from the navigation bar.',
      },
      {
        q: "Is my messaging private?",
        a: "Messages are only visible to you and the other person in the conversation. However, messages may be reviewed by admins if a report is filed.",
      },
    ],
  },
  {
    title: "Account & Safety",
    icon: Shield,
    questions: [
      {
        q: "Who can use GBC Marketplace?",
        a: "Only George Brown College students, faculty, and staff with a valid @georgebrown.ca email address can create an account.",
      },
      {
        q: "How do I report a user or listing?",
        a: 'Use the "Report" button on any listing, or visit the Report a Listing page. Provide a detailed description of the issue. Our admin team reviews all reports.',
      },
      {
        q: "What happens if I get reported?",
        a: "Reports are reviewed by our admin team. If a violation is confirmed, you may receive a warning, temporary suspension, or permanent ban depending on the severity.",
      },
      {
        q: "How do I update my profile?",
        a: "Your profile information is synced from your George Brown College account. Visit the Profile page to view your details and listings.",
      },
    ],
  },
  {
    title: "Community",
    icon: User,
    questions: [
      {
        q: "What are forums?",
        a: "Forums are discussion boards where students can ask questions, share advice, and connect with others. You can create posts, reply to others, and like content.",
      },
      {
        q: "How do clubs work?",
        a: "Clubs are student-created groups around shared interests. You can join existing clubs or create your own. Club members can post in club-specific forums.",
      },
      {
        q: "How do I create or join an event?",
        a: 'Visit the Events page to browse upcoming campus events. Click "RSVP" to join, or create your own event to organize meetups, study groups, or sales.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left"
    >
      <div className="flex items-center justify-between py-3 border-b border-border">
        <span className="text-sm font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <p className="text-sm text-muted-foreground py-3">{answer}</p>
      )}
    </button>
  );
}

function HelpCentreContent() {
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
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Help Centre</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Find answers to frequently asked questions about using GBC
          Marketplace.
        </p>

        <div className="space-y-8">
          {faqSections.map((section) => (
            <div
              key={section.title}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <div>
                {section.questions.map((faq) => (
                  <FAQItem
                    key={faq.q}
                    question={faq.q}
                    answer={faq.a}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Admin
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function HelpCentrePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <HelpCentreContent />
    </Suspense>
  );
}
