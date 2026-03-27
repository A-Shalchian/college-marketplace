"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { categories } from "@/components/category-filter";
import {
  Camera,
  X,
  Loader2,
  ChevronRight,
  Shield,
  Check,
  MapPin,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const conditions = ["New", "Like New", "Good", "Fair"];
const campuses = [
  "St. James Campus",
  "Casa Loma Campus",
  "Waterfront Campus",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB after compression
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGES = 10;
const COMPRESS_MAX_WIDTH = 1200;
const COMPRESS_QUALITY = 0.8;

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_FILE_SIZE) return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round((height * COMPRESS_MAX_WIDTH) / width);
        width = COMPRESS_MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
        },
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

const campusMapUrls: Record<string, string> = {
  "St. James Campus": "https://maps.google.com/maps?q=George+Brown+College+St+James+Campus,Toronto&z=15&output=embed",
  "Casa Loma Campus": "https://maps.google.com/maps?q=George+Brown+College+Casa+Loma+Campus,Toronto&z=15&output=embed",
  "Waterfront Campus": "https://maps.google.com/maps?q=George+Brown+College+Waterfront+Campus,Toronto&z=15&output=embed",
};

function SellContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useQuery(api.users.getCurrentUser);
  const createListing = useMutation(api.listings.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [campus, setCampus] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem("listingDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setPrice(draft.price || "");
        setCategory(draft.category || "");
        setCondition(draft.condition || "");
        setCampus(draft.campus || "");
        if (draft.imagePreviews && draft.imagePreviews.length > 0) {
          setImagePreviews(draft.imagePreviews);
        }
        setHasDraft(true);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser?.defaultCampus && !campus && !hasDraft) {
      setCampus(currentUser.defaultCampus);
    }
  }, [currentUser?.defaultCampus, campus, hasDraft]);

  const saveDraft = () => {
    const draft = {
      title,
      description,
      price,
      category,
      condition,
      campus,
      imagePreviews,
      savedAt: Date.now(),
    };
    localStorage.setItem("listingDraft", JSON.stringify(draft));
    setDraftSaved(true);
    setHasDraft(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const clearDraft = () => {
    localStorage.removeItem("listingDraft");
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setCondition("");
    setCampus(currentUser?.defaultCampus || "");
    setImageFiles([]);
    setImagePreviews([]);
    setHasDraft(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + imageFiles.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not a valid image type. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`"${file.name}" is too large (${sizeMB}MB). Maximum size is 2MB.`);
        continue;
      }
      if (file.size === 0) {
        alert(`"${file.name}" is empty.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length + imageFiles.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not a valid image type. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`"${file.name}" is too large (${sizeMB}MB). Maximum size is 2MB.`);
        continue;
      }
      if (file.size === 0) {
        alert(`"${file.name}" is empty.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(price) < 0) {
      newErrors.price = "Price cannot be negative";
    } else if (parseFloat(price) > 10000) {
      newErrors.price = "Price seems too high. Contact us for high-value items.";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!condition) {
      newErrors.condition = "Please select a condition";
    }

    if (!campus) {
      newErrors.campus = "Please select a campus";
    }

    if (imageFiles.length === 0) {
      newErrors.images = "At least one image is required";
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors.images = `Invalid file type for "${file.name}". Only JPEG, PNG, and WebP images are allowed.`;
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        newErrors.images = `File "${file.name}" is too large (${sizeMB}MB). Maximum size is 2MB.`;
        break;
      }
      if (file.size === 0) {
        newErrors.images = `File "${file.name}" is empty.`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const compressed = await compressImage(file);
        const uploadUrl = await generateUploadUrl({ userId: currentUser._id });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": compressed.type },
          body: compressed,
        });
        const { storageId } = await result.json();
        return storageId;
      });

      const storageIds = await Promise.all(uploadPromises);

      await createListing({
        sellerId: currentUser._id,
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        campus,
        images: storageIds,
      });

      localStorage.removeItem("listingDraft");
      toast.success("Listing published!");
      router.push("/");
    } catch (error) {
      console.error("Failed to create listing:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title && description && price && category && condition && campus && currentUser && imageFiles.length > 0;

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to create a listing</p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <nav className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-500 text-sm font-medium hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/sell" className="text-gray-500 text-sm font-medium hover:text-primary">
            Sell
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-primary text-sm font-bold">New Listing</span>
        </nav>

        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Create New Listing
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Sell safely to fellow George Brown students.
            </p>
          </div>
          <div className="flex gap-3">
            {hasDraft && (
              <button
                type="button"
                onClick={clearDraft}
                className="hidden md:flex items-center justify-center rounded-xl h-11 px-4 text-accent-coral font-bold text-sm hover:bg-accent-coral/10 transition-all"
              >
                Clear Draft
              </button>
            )}
            <button
              type="button"
              onClick={saveDraft}
              className="hidden md:flex items-center justify-center rounded-xl h-11 px-6 bg-white border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              {draftSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-accent-mint" />
                  Saved!
                </>
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex items-center justify-center rounded-xl h-11 px-6 md:px-8 bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
          </div>
        </div>

        {hasDraft && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-primary">
                Draft restored from your previous session
              </p>
            </div>
            <div className="flex gap-2 md:hidden">
              <button
                type="button"
                onClick={clearDraft}
                className="px-3 py-1.5 text-accent-coral font-semibold text-sm hover:bg-accent-coral/10 rounded-lg transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="px-3 py-1.5 bg-white border border-gray-200 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-all"
              >
                {draftSaved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Photos</h3>
                  <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">
                    Up to 10 photos
                  </span>
                </div>
                {errors.images && (
                  <p className="text-accent-coral text-sm mb-3">{errors.images}</p>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="group relative flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all px-6 py-10 md:py-12 cursor-pointer"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <p className="text-sm md:text-base font-bold">
                      Drag and drop images here
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm">
                      Or click to browse from your device
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 md:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-1 right-1 p-1 bg-accent-coral text-white rounded-full hover:bg-accent-coral/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-xl p-5 md:p-8 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-5 md:gap-y-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold flex items-center gap-1">
                      Item Title <span className="text-accent-coral">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What are you selling?"
                      className={`w-full h-12 rounded-xl border bg-white px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                        errors.title ? "border-accent-coral" : "border-gray-200"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-accent-coral text-xs">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full h-12 rounded-xl border bg-white px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                        errors.category ? "border-accent-coral" : "border-gray-200"
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                    </select>
                    {errors.category && (
                      <p className="text-accent-coral text-xs">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold">Price (CAD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full h-12 pl-8 rounded-xl border bg-white px-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                          errors.price ? "border-accent-coral" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-accent-coral text-xs">{errors.price}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-bold">Condition</label>
                    {errors.condition && (
                      <p className="text-accent-coral text-xs">{errors.condition}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {conditions.map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setCondition(cond)}
                          className={`px-4 md:px-5 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                            condition === cond
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 text-gray-500 hover:border-primary/50"
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell buyers more about your item. Mention pick-up preferences at St. James, Casa Loma, or Waterfront campus."
                      rows={5}
                      className={`w-full rounded-xl border bg-white p-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none ${
                        errors.description ? "border-accent-coral" : "border-gray-200"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-accent-coral text-xs">{errors.description}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="bg-primary/5 rounded-xl p-5 md:p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-bold">Safety First</h4>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Meet in well-lit campus areas like the LLC Library or Student Hub.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Use official student messaging for communication.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Accept e-transfer or cash in person. Never pay beforehand.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold mb-4">Campus Location</h4>
                <div className="rounded-lg h-32 md:h-40 bg-gray-100 mb-4 overflow-hidden relative">
                  {campus && campusMapUrls[campus] ? (
                    <iframe
                      src={campusMapUrls[campus]}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${campus} Map`}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                      </div>
                    </>
                  )}
                </div>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Choose a campus</option>
                  {campuses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-accent-coral/10 rounded-xl p-5 md:p-6 border border-accent-coral/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent-coral" />
                  <h4 className="font-bold">Boost your reach</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Items with clear photos and fair prices sell 3x faster in the GBC community.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 mb-6 md:mb-8 flex items-center justify-center">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-8 md:px-10 py-3 md:py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publish My Listing
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SellContent />
    </Suspense>
  );
}
