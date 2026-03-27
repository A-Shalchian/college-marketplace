"use client";

import { Sparkles, Book, Laptop, Armchair, Shirt, Bike, MoreHorizontal } from "lucide-react";

export const categories = [
  { id: "all", label: "For You", icon: Sparkles },
  { id: "textbooks", label: "Textbooks", icon: Book },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "furniture", label: "Furniture", icon: Armchair },
  { id: "clothing", label: "Fashion", icon: Shirt },
  { id: "transportation", label: "Transport", icon: Bike },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  vertical?: boolean;
}

export function CategoryFilter({ selected, onSelect, vertical = false }: CategoryFilterProps) {
  if (vertical) {
    return (
      <nav className="space-y-0.5">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isSelected ? "text-primary" : ""}`} />
              <span>{category.label}</span>
              {isSelected && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pr-16 md:pr-0">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-primary/30 dark:hover:border-primary/30"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isSelected ? "" : "text-muted-foreground"}`} />
              <p className={`text-sm ${isSelected ? "font-semibold" : "font-medium"}`}>
                {category.label}
              </p>
            </button>
          );
        })}
      </div>
      <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
    </div>
  );
}
