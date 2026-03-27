"use client";

import { Suspense, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Users,
  MapPin,
  User,
  MessageSquareText,
  ThumbsUp,
  MessageCircle,
  Trash2,
  LogOut,
  Shield,
  Pencil,
  ImagePlus,
  X,
} from "lucide-react";

function ClubDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const clubId = params.id as Id<"clubs">;

  const club = useQuery(api.clubs.getClubById, { clubId });
  const members = useQuery(api.clubs.getClubMembers, { clubId });
  const posts = useQuery(api.clubs.getClubPosts, { clubId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const membership = useQuery(
    api.clubs.isMember,
    isAuthenticated ? { clubId } : "skip"
  );

  const joinClub = useMutation(api.clubs.joinClub);
  const leaveClub = useMutation(api.clubs.leaveClub);
  const deleteClub = useMutation(api.clubs.deleteClub);
  const updateClub = useMutation(api.clubs.updateClub);
  const createClubPost = useMutation(api.clubs.createClubPost);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const editImageRef = useRef<HTMLInputElement>(null);

  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [postError, setPostError] = useState("");

  if (club === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (club === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground">Club not found</p>
          <Link
            href="/community/clubs"
            className="inline-block mt-4 text-primary font-semibold hover:underline"
          >
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = currentUser && club.creatorId === currentUser._id;
  const isSiteAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const canEdit = isCreator || isSiteAdmin;
  const canDelete = isCreator || isSiteAdmin;
  const isMember = !!membership;

  const openEditForm = () => {
    setEditName(club.name);
    setEditDescription(club.description);
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditError("");
    setShowEditForm(true);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setEditError("Image must be under 2MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setEditError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setEditImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isEditSubmitting) return;

    setEditError("");
    if (editName.trim().length < 3) {
      setEditError("Club name must be at least 3 characters");
      return;
    }
    if (editDescription.trim().length < 10) {
      setEditError("Description must be at least 10 characters");
      return;
    }

    setIsEditSubmitting(true);
    try {
      let imageId: string | undefined;
      if (editImageFile) {
        const uploadUrl = await generateUploadUrl({ userId: currentUser._id });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": editImageFile.type },
          body: editImageFile,
        });
        const { storageId } = await result.json();
        imageId = storageId;
      }

      await updateClub({
        clubId,
        name: editName.trim(),
        description: editDescription.trim(),
        ...(imageId !== undefined && { imageId }),
      });
      setShowEditForm(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update club");
    }
    setIsEditSubmitting(false);
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinClub({ clubId });
    } catch (err) {
      console.error(err);
    }
    setIsJoining(false);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveClub({ clubId });
    } catch (err) {
      console.error(err);
    }
    setIsLeaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClub({ clubId });
      router.push("/community/clubs");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPostSubmitting) return;

    setPostError("");
    if (postTitle.trim().length < 3) {
      setPostError("Title must be at least 3 characters");
      return;
    }
    if (postContent.trim().length < 10) {
      setPostError("Content must be at least 10 characters");
      return;
    }

    setIsPostSubmitting(true);
    try {
      await createClubPost({
        clubId,
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
      });
      setPostTitle("");
      setPostContent("");
      setPostCategory("general");
      setShowPostForm(false);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to create post");
    }
    setIsPostSubmitting(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-primary/10 text-primary",
      Sports: "bg-accent-coral/10 text-accent-coral",
      Arts: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      Technology: "bg-accent-mint/10 text-accent-mint",
      Social: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      Cultural: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <Link
          href="/community/clubs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>

        {club.imageUrl && (
          <div
            className="w-full h-48 md:h-64 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${club.imageUrl})` }}
          />
        )}

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6">
          {showEditForm ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Club Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Club Image</label>
                <input
                  ref={editImageRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
                {editImagePreview ? (
                  <div className="relative inline-block">
                    <div
                      className="w-32 h-32 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${editImagePreview})` }}
                    />
                    <button
                      type="button"
                      onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editImageRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {club.imageUrl ? "Change image" : "Add image"}
                  </button>
                )}
              </div>
              {editError && (
                <p className="text-red-500 text-xs font-medium">{editError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting || !editName.trim() || !editDescription.trim()}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(club.category)}`}>
                    {club.category}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{club.name}</h1>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{club.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {club.campus}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex flex-col gap-2 shrink-0">
                  {!isMember ? (
                    <button
                      onClick={handleJoin}
                      disabled={isJoining}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                      Join Club
                    </button>
                  ) : !isCreator ? (
                    <button
                      onClick={handleLeave}
                      disabled={isLeaving}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-muted text-gray-700 dark:text-muted-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-border transition-all disabled:opacity-50"
                    >
                      {isLeaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                      Leave
                    </button>
                  ) : null}
                  {canEdit && (
                    <button
                      onClick={openEditForm}
                      className="flex items-center gap-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  )}
                  {canDelete && (
                    <>
                      {showDeleteConfirm ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-xl font-bold text-xs hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-2 rounded-xl font-bold text-xs bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-border transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6">
          <h2 className="font-bold text-lg mb-4">Members ({club.memberCount})</h2>
          {members === undefined ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-muted/50"
                >
                  {member.user?.imageUrl ? (
                    <div
                      className="w-9 h-9 rounded-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${member.user.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{member.user?.name || "Unknown"}</p>
                    {member.role === "admin" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No members yet</p>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Club Discussions</h2>
            {isMember && (
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
              >
                <MessageSquareText className="w-4 h-4" />
                New Post
              </button>
            )}
          </div>

          {showPostForm && (
            <form onSubmit={handlePostSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-muted/50 rounded-xl space-y-4">
              <div>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post title"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your post..."
                  rows={4}
                  maxLength={10000}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              <div>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="general">General</option>
                  <option value="course_help">Course Help</option>
                  <option value="housing">Housing</option>
                  <option value="campus_life">Campus Life</option>
                </select>
              </div>
              {postError && (
                <p className="text-red-500 text-xs font-medium">{postError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="px-4 py-2 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPostSubmitting || !postTitle.trim() || !postContent.trim()}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPostSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </button>
              </div>
            </form>
          )}

          {posts === undefined ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/community/forums/${post._id}`}
                  className="block p-4 rounded-xl bg-gray-50 dark:bg-muted/50 hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                >
                  <h3 className="font-bold text-sm mb-1">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium">{post.author?.name || "Unknown"}</span>
                    <span>{getTimeAgo(post.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {post.replyCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquareText className="w-10 h-10 text-gray-300 dark:text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No discussions yet</p>
              {isMember && (
                <p className="text-xs text-muted-foreground/70 mt-1">Start a conversation with your club members!</p>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ClubDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ClubDetailContent />
    </Suspense>
  );
}
