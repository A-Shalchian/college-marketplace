"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Mail, ChevronLeft, Clock, MessageCircle, Shield, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const topics = [
  "Account issue",
  "Listing problem",
  "Report a user",
  "Bug report",
  "Feature suggestion",
  "General question",
  "Other",
];

function ContactContent() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.contact.send);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("You must be signed in to contact admin.");
      return;
    }
    if (!topic) {
      setError("Please select a topic.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Please provide more detail (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await sendMessage({ topic, message });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Message Sent</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. Our admin team will get back to you
              within 24–48 hours.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
          <Mail className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Contact Admin</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          Have a question or need help? Our admin team is here to assist you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Response Time</p>
            <p className="text-xs text-muted-foreground">24–48 hours</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <MessageCircle className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Community</p>
            <p className="text-xs text-muted-foreground">
              <Link href="/community/forums" className="hover:text-primary transition-colors">
                Ask on Forums
              </Link>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Urgent?</p>
            <p className="text-xs text-muted-foreground">
              <Link href="/report" className="hover:text-primary transition-colors">
                Report a Listing
              </Link>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium mb-3">
              Topic <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    topic === t
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <label className="block text-sm font-medium mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ContactContent />
    </Suspense>
  );
}
