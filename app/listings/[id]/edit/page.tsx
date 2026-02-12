"use client";

import { use, useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";

const conditions = ["New", "Like New", "Good", "Fair"];
const campuses = [
  "St. James Campus",
  "Casa Loma Campus",
  "Waterfront Campus",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGES = 10;

function EditListingContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listing = useQuery(api.listings.getById, {
    listingId: id as Id<"listings">,
  });
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const updateListing = useMutation(api.listings.update);
  const deleteListing = useMutation(api.listings.deleteListing);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [campus, setCampus] = useState("St. James Campus");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (listing && !initialized) {
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(listing.price.toString());
      setCategory(listing.category);
      setCondition(listing.condition);
      setCampus(listing.campus || "St. James Campus");
      setExistingImages(listing.images);
      setExistingImageUrls(listing.imageUrls);
      setInitialized(true);
    }
  }, [listing, initialized]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > MAX_IMAGES) {
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
        alert(`"${file.name}" is too large (${sizeMB}MB). Maximum size is 5MB.`);
        continue;
      }
      if (file.size === 0) {
        alert(`"${file.name}" is empty.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > MAX_IMAGES) {
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
        alert(`"${file.name}" is too large (${sizeMB}MB). Maximum size is 5MB.`);
        continue;
      }
      if (file.size === 0) {
        alert(`"${file.name}" is empty.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleExistingImageRemove = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewImageRemove = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
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
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!condition) {
      newErrors.condition = "Please select a condition";
    }

    if (existingImages.length + newImageFiles.length === 0) {
      newErrors.images = "At least one image is required";
    }

    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        newErrors.images = `Invalid file type for "${file.name}". Only JPEG, PNG, and WebP images are allowed.`;
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        newErrors.images = `File "${file.name}" is too large (${sizeMB}MB). Maximum size is 5MB.`;
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
    if (!currentUser || !listing) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const uploadPromises = newImageFiles.map(async (file) => {
        const uploadUrl = await generateUploadUrl({ userId: currentUser._id });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        return storageId;
      });

      const newStorageIds = await Promise.all(uploadPromises);

      await updateListing({
        listingId: listing._id,
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        campus,
        images: [...existingImages, ...newStorageIds],
      });

      router.push(`/listings/${listing._id}`);
    } catch (error) {
      console.error("Failed to update listing:", error);
      alert("Failed to update listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!listing || !currentUser) return;
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteListing({ listingId: listing._id });
      router.push("/profile");
    } catch (error) {
      console.error("Failed to delete listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (listing === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Listing not found</p>
          <Link href="/" className="text-primary hover:underline mt-4 block font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser?._id !== listing.sellerId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">You can only edit your own listings</p>
          <Link href="/" className="text-primary hover:underline mt-4 block font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isFormValid = title && description && price && category && condition && campus && (existingImages.length + newImageFiles.length > 0);
  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <nav className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-500 text-sm font-medium hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href={`/listings/${listing._id}`} className="text-gray-500 text-sm font-medium hover:text-primary">
            {listing.title}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-primary text-sm font-bold">Edit</span>
        </nav>

        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Edit Listing
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Update your listing details below.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center rounded-xl h-11 px-4 md:px-6 bg-accent-coral/10 text-accent-coral font-bold text-sm hover:bg-accent-coral/20 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex items-center justify-center rounded-xl h-11 px-6 md:px-8 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Photos</h3>
                  <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">
                    {totalImages}/10 photos
                  </span>
                </div>
                {errors.images && (
                  <p className="text-accent-coral text-sm mb-3">{errors.images}</p>
                )}

                {totalImages > 0 && (
                  <div className="mb-4 grid grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImageUrls.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20"
                      >
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleExistingImageRemove(index)}
                          className="absolute top-1 right-1 p-1 bg-accent-coral text-white rounded-full hover:bg-accent-coral/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {newImagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-accent-mint"
                      >
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-accent-mint text-white rounded text-[10px] font-bold">
                          NEW
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNewImageRemove(index)}
                          className="absolute top-1 right-1 p-1 bg-accent-coral text-white rounded-full hover:bg-accent-coral/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {totalImages < 10 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="group relative flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all px-6 py-8 md:py-10 cursor-pointer"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                      <p className="text-sm md:text-base font-bold">
                        Add more photos
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Drag and drop or click to browse
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
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
                  <h4 className="font-bold">Editing Tips</h4>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Update photos if the item condition has changed.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Lower the price to attract more buyers.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">
                      Add more details to your description.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold mb-4">Campus Location</h4>
                <div className="rounded-lg h-32 md:h-40 bg-gray-100 mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                </div>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {campuses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-accent-coral/10 rounded-xl p-5 md:p-6 border border-accent-coral/20">
                <div className="flex items-center gap-3 mb-2">
                  <Trash2 className="w-5 h-5 text-accent-coral" />
                  <h4 className="font-bold">Delete Listing</h4>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  This action cannot be undone. All data will be permanently removed.
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-accent-coral text-white rounded-lg text-sm font-bold hover:bg-accent-coral/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete This Listing"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 mb-6 md:mb-8 flex items-center justify-center">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-8 md:px-10 py-3 md:py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
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

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditListingContent id={id} />
    </Suspense>
  );
}
