# Performance & Resource Optimization Fixes

**Date:** March 26, 2026
**Problem:** Convex free plan limits exceeded — File Bandwidth at 1.85 GB / 1 GB (185%)

---

## Root Cause Analysis

The application was designed with patterns that multiplied every page load into hundreds of unnecessary database calls, storage URL resolutions, and bandwidth consumption. No single user or malicious actor caused the spike — the architecture was set up to fail at scale.

### Key Metrics (Before Fixes)
- **File Bandwidth:** 1.85 GB / 1 GB (over limit)
- **Function Calls:** 18K / 1M (growing fast)
- **File Storage:** 17.47 MB / 1 GB (fine)
- **Database Storage:** 1020 KB / 512 MB (fine)

---

## Fixes Implemented

### 1. Image Bandwidth — The Biggest Win

**Problem:** Every homepage load resolved ALL image URLs (up to 10) for every listing (up to 50). That's 500 `storage.getUrl()` calls per page view. The listing card only shows one image.

**Files changed:**
- `convex/listings.ts` — `getAll` and `getByUser` now only resolve the **first image** per listing
- `convex/admin.ts` — `getAllListings` and `getFlaggedListings` — same optimization
- `convex/savedListings.ts` — same optimization
- `convex/messages.ts` — conversation detail — same optimization

**Impact:** ~90% reduction in storage URL resolutions per page load.

---

### 2. Image Compression & Size Limits

**Problem:** 5MB max file size with no compression meant phone photos uploaded at full resolution (3-5MB each).

**Files changed:**
- `app/sell/page.tsx` — Added client-side image compression (resizes to max 1200px, JPEG 80% quality). Lowered `MAX_FILE_SIZE` from 5MB to 2MB.
- `app/listings/[id]/edit/page.tsx` — Same 2MB limit
- `app/community/clubs/create/page.tsx` — Same 2MB limit
- `app/community/clubs/[id]/page.tsx` — Same 2MB limit
- `convex/security.ts` — Server-side `imageSize.maxBytes` reduced from 5MB to 2MB

**Impact:** New uploads are 5-10x smaller. A typical phone photo goes from ~4MB to ~300-400KB.

---

### 3. Lazy Loading for Listing Cards

**Problem:** Listing cards used CSS `background-image` which loads all images eagerly, even those off-screen.

**Files changed:**
- `components/listing-card.tsx` — Replaced `background-image` div with `<img loading="lazy" decoding="async">`

**Impact:** Only visible images load. Off-screen cards defer loading until scrolled into view.

---

### 4. getUnreadCount — Eliminated Sequential N+1

**Problem:** The navbar unread badge called `getUnreadCount` on EVERY page load. For each conversation, it made a sequential DB call to fetch the latest message. 30 conversations = 30 sequential DB calls.

**File changed:** `convex/messages.ts`

**Fix:** Now uses `conv.lastMessageAt` timestamp (already stored on conversation) to skip conversations that are clearly read. Only queries the messages table for conversations that *might* be unread.

**Impact:** Reduces from N sequential message queries to only the unread subset.

---

### 5. admin.getStats — Eliminated Full Table Scans

**Problem:** Admin dashboard loaded ALL users, ALL listings, ALL reports into memory just to count them.

**File changed:** `convex/admin.ts`

**Fix:** Uses targeted indexed queries (`by_status`, `by_moderation_status`) to fetch only the subsets needed. Counts are derived from indexed query results. Recent users (for time-based stats) use a time-filtered query instead of loading all users.

**Impact:** From 3 full table scans to ~6 small indexed queries run in parallel.

---

### 6. admin.getAllUsers — Reduced N+1

**Problem:** For 200 users, loaded ALL listings per user (200 x `.collect()`) just to count them.

**File changed:** `convex/admin.ts`

**Fix:** Reduced user fetch to 100, uses `.filter()` for active status and `.take(200)` cap instead of unbounded `.collect()`.

---

### 7. Pagination Limits Added Everywhere

**Problem:** Forums, clubs, events, and saved listings used `.collect()` with no limit, loading entire tables.

**Files changed:**
- `convex/forums.ts` — `getPosts` now uses `.take(100)` instead of `.collect()`
- `convex/clubs.ts` — `getClubs` uses `.take(100)` and filters via `by_status` index
- `convex/events.ts` — `getEvents` uses `.take(100)` and filters via `by_status` index
- `convex/savedListings.ts` — `getSavedByUser` uses `.take(50)` instead of unbounded `.collect()`

**Impact:** Prevents unbounded table scans. Maximum records loaded is now capped.

---

### 8. savedListings — Sequential to Parallel

**Problem:** `getSavedByUser` used a `for` loop (sequential) instead of `Promise.all` (parallel).

**File changed:** `convex/savedListings.ts`

**Fix:** Converted to `Promise.all` with `.map()` pattern. Also added `.take(50)` limit.

**Impact:** N sequential DB calls become N parallel calls — much faster response time.

---

### 9. listings.getAll — Server-Side numItems Cap

**Problem:** Client could pass `numItems: 10000` to fetch unlimited listings.

**File changed:** `convex/listings.ts`

**Fix:** Server now caps `numItems` at 50 regardless of client input: `Math.min(raw.numItems, 50)`.

---

### 10. useStoreUser — Debounced User Sync

**Problem:** The `useStoreUser` hook included `storeUser` in its dependency array, causing the sync mutation to fire on every re-render cycle, not just on login.

**File changed:** `hooks/use-store-user.ts`

**Fix:** Added a `useRef` flag (`hasSynced`) that ensures the store mutation only fires once per authentication session. Removed `storeUser` from the dependency array.

**Impact:** From potentially dozens of unnecessary mutations per session to exactly 1.

---

## Remaining Known Issues

These were identified but not fixed in this pass:

| Issue | Location | Notes |
|---|---|---|
| Events `attendeeCount` uses `.collect().length` in a loop | `convex/events.ts:52-57` | Should use a `memberCount` field on the event document |
| `files.ts` `deleteFile` loads all user listings to check ownership | `convex/files.ts:26-30` | Should query by image storage ID directly |
| Public routes expose expensive queries to bots | `middleware.ts` | Consider rate limiting at CDN/edge level |
| Blocklist fetched from DB on every content mutation | Multiple files | Could be cached or loaded less frequently |
| No server-side file size validation on upload | `convex/files.ts` | `generateUploadUrl` doesn't validate; relies on client-side checks only |

---

## Expected Impact

| Metric | Before | After (estimated) |
|---|---|---|
| Storage URL calls per homepage load | ~500 | ~50 |
| Image size per upload | 3-5 MB | 200-400 KB |
| getUnreadCount DB calls (30 convos) | 30 sequential | 0-5 (only unread) |
| admin.getStats table scans | 3 full tables | 6 small indexed queries |
| Forum/club/event query size | Unbounded | Capped at 100 |
| User sync mutations per session | 5-20+ | 1 |
