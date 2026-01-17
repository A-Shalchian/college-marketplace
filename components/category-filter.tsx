"use client";

import { Book, Laptop, Sofa, Shirt, Bike, MoreHorizontal } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: null },
  { id: "textbooks", label: "Textbooks", icon: Book },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "transportation", label: "Transportation", icon: Bike },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { categories };
