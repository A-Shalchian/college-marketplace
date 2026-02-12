"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2,
  Plus,
  X,
  Save,
  AlertTriangle,
  Shield,
  Pill,
  Heart,
  Crosshair,
  BadgeAlert,
  Code,
} from "lucide-react";
import { useAdminContext } from "../AdminContext";

const categories = [
  { id: "drugs", label: "Drugs & Substances", icon: Pill, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20" },
  { id: "sexual", label: "Sexual Content", icon: Heart, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/20" },
  { id: "weapons", label: "Weapons", icon: Crosshair, color: "text-red-600 bg-red-100 dark:bg-red-900/20" },
  { id: "scam", label: "Scam Indicators", icon: BadgeAlert, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20" },
  { id: "coded", label: "Coded Language", icon: Code, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
];

export default function AdminSettings() {
  const { adminId } = useAdminContext();
  const blocklist = useQuery(api.settings.getBlocklist);
  const initializeBlocklist = useMutation(api.settings.initializeBlocklist);
  const updateBlocklist = useMutation(api.settings.updateBlocklist);

  const [activeCategory, setActiveCategory] = useState("drugs");
  const [keywords, setKeywords] = useState<Record<string, string[]>>({});
  const [newKeyword, setNewKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (blocklist) {
      setKeywords(blocklist);
    }
  }, [blocklist]);

  const handleInitialize = async () => {
    try {
      await initializeBlocklist({});
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to initialize blocklist");
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const updated = {
      ...keywords,
      [activeCategory]: [...(keywords[activeCategory] || []), newKeyword.trim().toLowerCase()],
    };
    setKeywords(updated);
    setNewKeyword("");
    setHasChanges(true);
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = {
      ...keywords,
      [activeCategory]: (keywords[activeCategory] || []).filter((k) => k !== keyword),
    };
    setKeywords(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBlocklist({
        category: activeCategory,
        keywords: keywords[activeCategory] || [],
      });
      setHasChanges(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = !blocklist || Object.values(blocklist).every((arr) => (arr as string[]).length === 0);

  if (blocklist === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Moderation Settings</h1>
          <p className="text-muted-foreground mt-1">Manage blocked keywords for content moderation</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-6 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        )}
      </div>

      {isEmpty && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-500">No Blocklist Found</h3>
              <p className="text-yellow-700 dark:text-yellow-600 text-sm mt-1 mb-4">
                The moderation blocklist hasn&apos;t been initialized yet. Click below to set up default keywords.
              </p>
              <button
                onClick={handleInitialize}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold text-sm hover:bg-yellow-700 transition-colors"
              >
                Initialize Default Blocklist
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Categories
              </h2>
            </div>
            <div className="p-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = keywords[cat.id]?.length || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-white"
                        : "hover:bg-gray-50 dark:hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left font-medium text-sm">{cat.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeCategory === cat.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold">
                  {categories.find((c) => c.id === activeCategory)?.label} Keywords
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {keywords[activeCategory]?.length || 0} keywords in this category
                </p>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                  placeholder="Add new keyword..."
                  className="flex-1 h-11 px-4 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim()}
                  className="h-11 px-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              {!keywords[activeCategory] || keywords[activeCategory].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No keywords in this category</p>
                  <p className="text-sm mt-1">Add keywords above to start blocking content</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {keywords[activeCategory].map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-muted rounded-lg group"
                    >
                      <span className="text-sm font-medium">{keyword}</span>
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-border rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-xl">
            <h3 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-2">How Moderation Works</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
              <li>• Listings are scanned when created or updated</li>
              <li>• 1-2 keyword matches = Flagged for review</li>
              <li>• 3+ keyword matches = Auto-rejected</li>
              <li>• Changes take effect immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
