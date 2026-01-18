# GBC Marketplace - Project Status

## Project Overview
A college marketplace application exclusively for George Brown College students to buy and sell items within the campus community.

**Tech Stack:** Next.js 15 | React 19 | Convex | Clerk | Tailwind CSS 4

---

## Sprint 4: Admin Dashboard & Content Moderation

### Sprint Goal
Build comprehensive admin dashboard for content moderation, user management, and platform safety.

### Sprint Duration
January 2026

---

## Sprint 4 Completed Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Admin Dashboard** | Protected admin area at /admin with role-based access | ✅ Complete |
| **Admin Overview** | Stats dashboard with users, listings, reports, flagged content | ✅ Complete |
| **Listings Management** | View all listings, filter by status, approve/reject/remove | ✅ Complete |
| **Users Management** | View all users, ban/unban, warn, change roles | ✅ Complete |
| **Reports System** | User-submitted reports with resolution workflow | ✅ Complete |
| **Keyword Moderation** | Auto-flag/reject listings with blocked keywords | ✅ Complete |
| **Settings Page** | Admin UI to manage blocked keywords by category | ✅ Complete |
| **Role System** | user/admin/super_admin roles with access control | ✅ Complete |
| **Moderation Logs** | Audit trail of all admin actions | ✅ Complete |
| **Mobile Admin UI** | Responsive admin dashboard with collapsible sidebar | ✅ Complete |

---

## Sprint 3 Completed Features (Previous)

### Sprint Goal
Enhance user profile experience with settings management, dark mode theming, and improved navigation.

## Sprint 3 Completed Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dark Mode** | Full theme toggle with light/dark modes, persists to localStorage | ✅ Complete |
| **Theme Provider** | React context for theme state management across app | ✅ Complete |
| **Settings Dropdown** | Profile settings menu with campus, theme, help, sign out | ✅ Complete |
| **Default Campus Setting** | User preference auto-fills on new listings | ✅ Complete |
| **Help & Support Modal** | FAQ accordion with common questions and contact info | ✅ Complete |
| **Edit Listing Redesign** | Matched to create listing design with sidebar tips | ✅ Complete |
| **Delete Listing from Edit** | Delete button with confirmation on edit page | ✅ Complete |
| **Dashboard Navigation** | Added Dashboard link in UserButton dropdown | ✅ Complete |
| **My Listings Navigation** | Quick link to profile listings section | ✅ Complete |
| **Edit Profile Button** | Opens Clerk profile management modal | ✅ Complete |
| **Dark Mode Components** | All components updated with dark: variants | ✅ Complete |

---

## Sprint 2 Completed Features (Previous)

| Feature | Description | Status |
|---------|-------------|--------|
| **Listing Detail Redesign** | New layout with image gallery, thumbnails, seller card, safety tips | ✅ Complete |
| **Create Listing Redesign** | Drag-drop photos, condition pills, sidebar with tips | ✅ Complete |
| **Messages Redesign** | Split-view inbox with conversation sidebar and chat area | ✅ Complete |
| **Campus Location Field** | Added campus selector (St. James, Casa Loma, Waterfront) | ✅ Complete |
| **Bottom Navigation** | Mobile-first bottom nav for Home, Search, Sell, Messages, Profile | ✅ Complete |
| **Footer Component** | Site footer with links and branding | ✅ Complete |
| **Mobile Search** | Dedicated mobile search component | ✅ Complete |
| **Responsive Design** | All pages optimized for mobile and desktop | ✅ Complete |
| **Breadcrumb Navigation** | Context-aware breadcrumbs on listing and sell pages | ✅ Complete |
| **Safety Reminders** | Dismissible safety tips in messages and listings | ✅ Complete |
| **Seller Info Card** | Enhanced seller profile display with rating, join date | ✅ Complete |
| **Chat Context Header** | Listing preview in chat with price and status | ✅ Complete |
| **Mark as Sold from Chat** | Sellers can mark items sold directly in conversation | ✅ Complete |
| **Image Gallery** | Clickable thumbnails with main image preview | ✅ Complete |
| **Up to 10 Photos** | Increased photo limit from 5 to 10 on create listing | ✅ Complete |

---

## Sprint 1 Completed Features (Previous)

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication** | Clerk auth with .georgebrown.ca email restriction | ✅ Complete |
| **User Management** | Auto-create user profiles on first sign-in | ✅ Complete |
| **Browse Listings** | Home page with listing grid | ✅ Complete |
| **Category Filter** | Filter by Textbooks, Electronics, Furniture, etc. | ✅ Complete |
| **Search** | Search listings by title and description | ✅ Complete |
| **Create Listing** | Post items with images, price, condition | ✅ Complete |
| **Image Upload** | Upload images via Convex storage | ✅ Complete |
| **View Listing** | Detailed listing page with seller info | ✅ Complete |
| **Edit Listing** | Modify existing listings | ✅ Complete |
| **Delete Listing** | Remove listings from profile | ✅ Complete |
| **Mark as Sold** | Update listing status to sold | ✅ Complete |
| **Messaging System** | Real-time chat between buyers and sellers | ✅ Complete |
| **Conversations List** | Inbox showing all conversations | ✅ Complete |
| **User Profile** | View own listings (active & sold) | ✅ Complete |
| **Input Validation** | Form validation with error messages | ✅ Complete |
| **404 Page** | Custom not found page | ✅ Complete |

---

## Sprint 4 Backlog (Next Up)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Saved/Wishlist Listings** | High | Heart button saves items, dedicated saved page |
| **Filter Tabs (Buying/Selling)** | High | Filter messages by transaction role |
| **Sort Options** | High | Sort listings by newest, price low-high, etc. |
| **Price Range Filter** | High | Filter by min/max price |
| **Campus Filter** | High | Filter listings by campus location |
| **Unread Message Badge** | High | Show unread count on messages icon |
| **Profile Page Stats** | Medium | Real ratings, transaction history |

---

## Sprint 5 Backlog (AI Moderation)

| Feature | Priority | Description |
|---------|----------|-------------|
| **OpenAI Moderation API** | High | Free API, catches context not just keywords |
| **Layered Moderation** | High | Keyword filter → AI check → Admin review |
| **Perspective API** | Medium | Google's toxicity detection for messages |
| **Claude Review** | Low | Nuanced AI judgment for edge cases |

### AI Moderation Implementation Plan

```
Layer 1: Keyword Filter (instant, free) - DONE
    ↓ passes
Layer 2: OpenAI Moderation API (free, catches context)
    ↓ passes
Layer 3: Active (no human review needed)

If flagged at any layer → Admin review queue
```

**Requirements:**
- OpenAI API key (free tier works)
- Convex action to call external API
- ~100ms added latency per listing

**API Options:**
| API | Cost | Speed | Best For |
|-----|------|-------|----------|
| OpenAI Moderation | Free | ~100ms | Sexual, violence, hate detection |
| Perspective API | Free (1 QPS) | ~200ms | Toxicity in messages |
| Claude Haiku | ~$0.0001/check | ~500ms | Nuanced context understanding |

---

## Sprint 6+ Backlog (Future)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Set Meeting Feature** | Medium | Schedule meetups with calendar integration |
| **Image Attachments in Chat** | Medium | Send photos in messages |
| **User Ratings & Reviews** | Medium | Rate buyers/sellers after transactions |
| **Report Listing/User** | Medium | Flag inappropriate content |
| **Push Notifications** | Medium | Real-time alerts for messages |
| **Email Notifications** | Medium | Email digest for new messages |
| **Recently Viewed** | Low | History of viewed listings |
| **Similar Listings** | Low | Recommendations based on viewing |
| **Share Listing** | Low | Share to social media |
| **Listing Expiration** | Low | Auto-hide listings after 30 days |
| **Draft Listings** | Low | Save draft functionality |
| **Boost Listing** | Low | Premium visibility feature |

---

## Technical Architecture

### Database Schema (Convex)

```
users
├── clerkId (string)
├── email (string)
├── name (string)
├── imageUrl (string?)
├── defaultCampus (string?)
├── role (string?: user | admin | super_admin)  ← Sprint 4
├── isBanned (boolean?)                          ← Sprint 4
├── banReason (string?)                          ← Sprint 4
├── warningCount (number?)                       ← Sprint 4
└── createdAt (number)

listings
├── sellerId (id → users)
├── title (string)
├── description (string)
├── price (number)
├── category (string)
├── condition (string)
├── campus (string)
├── images (string[])
├── status (string: active | sold | rejected | removed)
├── moderationStatus (string?: clean | flagged | rejected)  ← Sprint 4
├── moderationFlags (string[]?)                              ← Sprint 4
├── reviewedBy (id → users?)                                 ← Sprint 4
├── reviewedAt (number?)                                     ← Sprint 4
└── createdAt (number)

conversations
├── listingId (id → listings)
├── buyerId (id → users)
├── sellerId (id → users)
└── lastMessageAt (number)

messages
├── conversationId (id → conversations)
├── senderId (id → users)
├── content (string)
└── createdAt (number)

reports                          ← NEW Sprint 4
├── listingId (id → listings)
├── reporterId (id → users)
├── reason (string)
├── description (string?)
├── status (string: pending | resolved)
├── resolvedBy (id → users?)
├── resolvedAt (number?)
└── createdAt (number)

moderationLogs                   ← NEW Sprint 4
├── adminId (id → users)
├── action (string)
├── targetType (string)
├── targetId (string)
├── reason (string?)
├── metadata (string?)
└── createdAt (number)

settings                         ← NEW Sprint 4
├── key (string)
├── value (string - JSON)
└── updatedAt (number)
```

### Project Structure

```
college-marketplace/
├── app/
│   ├── page.tsx                    # Home (listings feed)
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Global styles & design tokens
│   ├── not-found.tsx               # 404 page
│   ├── sell/page.tsx               # Create listing (redesigned)
│   ├── profile/page.tsx            # User profile with settings
│   ├── messages/
│   │   ├── page.tsx                # Conversations list (redesigned)
│   │   └── [id]/page.tsx           # Chat thread (redesigned)
│   ├── listings/
│   │   └── [id]/
│   │       ├── page.tsx            # Listing detail (redesigned)
│   │       └── edit/page.tsx       # Edit listing (redesigned)
│   ├── admin/                       ← NEW Sprint 4
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── page.tsx                # Admin overview dashboard
│   │   ├── listings/page.tsx       # Listings management
│   │   ├── users/page.tsx          # Users management
│   │   ├── reports/page.tsx        # Reports management
│   │   └── settings/page.tsx       # Moderation settings
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   ├── navbar.tsx                  # Top navigation (dark mode)
│   ├── footer.tsx                  # Site footer (dark mode)
│   ├── bottom-nav.tsx              # Mobile bottom nav (dark mode)
│   ├── mobile-search.tsx           # Mobile search (dark mode)
│   ├── listing-card.tsx            # Listing grid card (dark mode)
│   ├── category-filter.tsx         # Category tabs (dark mode)
│   └── providers/
│       ├── convex-provider.tsx
│       └── theme-provider.tsx      ← NEW in Sprint 3
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── users.ts                    # User queries/mutations
│   ├── listings.ts                 # Listing queries/mutations
│   ├── messages.ts                 # Messaging queries/mutations
│   ├── files.ts                    # File upload
│   ├── admin.ts                    # Admin queries/mutations (Sprint 4)
│   ├── settings.ts                 # Settings management (Sprint 4)
│   └── moderation.ts               # Content moderation utils (Sprint 4)
├── hooks/
│   └── use-store-user.ts           # Sync Clerk user to Convex
├── stich/                          # UI design mockups (HTML)
│   ├── home.html
│   ├── listing.html
│   ├── createnewlisting.html
│   ├── buyersellermessage.html
│   └── user.html
└── middleware.ts                   # Auth middleware
```

---

## Design System

### Colors (Light Mode)
| Token | Value | Usage |
|-------|-------|-------|
| `background` | #f9fafa | Page backgrounds |
| `foreground` | #121517 | Primary text |
| `primary` | #28618a | Buttons, links, accents |
| `accent-mint` | #6EE7B7 | Success, verified badges |
| `accent-coral` | #FF7F66 | Errors, delete actions |
| `card` | #ffffff | Card backgrounds |
| `border` | #e5e7eb | Borders, dividers |
| `muted` | #f3f4f6 | Muted backgrounds |

### Colors (Dark Mode)
| Token | Value | Usage |
|-------|-------|-------|
| `background` | #0f1419 | Page backgrounds |
| `foreground` | #e7e9ea | Primary text |
| `primary` | #3b82f6 | Buttons, links, accents |
| `accent-mint` | #6EE7B7 | Success, verified badges |
| `accent-coral` | #FF7F66 | Errors, delete actions |
| `card` | #1a1f26 | Card backgrounds |
| `border` | #2f3336 | Borders, dividers |
| `muted` | #1a1f26 | Muted backgrounds |

### Campus Locations
- St. James Campus
- Casa Loma Campus
- Waterfront Campus

---

## Environment Setup

Required environment variables in `.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Clerk Configuration
- Email domain restriction: `georgebrown.ca`
- Location: Clerk Dashboard → User & Authentication → Restrictions → Allowlist

---

## Running the Project

```bash
# Single command runs both Next.js + Convex
npm run dev
```

App runs at: http://localhost:3000
Admin dashboard: http://localhost:3000/admin

---

## Sprint Metrics

| Metric | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Total |
|--------|----------|----------|----------|----------|-------|
| Features Completed | 16 | 15 | 11 | 10 | 52 |
| Features Pending | - | - | - | - | 13 |
| Completion Rate | 100% | 100% | 100% | 100% | 80% |

---

## Known Issues

1. Filter tabs (All/Buying/Selling) in messages are placeholder UI
2. Set Meeting button is placeholder UI
3. Image/attachment button in chat is placeholder UI
4. Search in messages sidebar is placeholder UI
5. Heart/save button on listings is placeholder UI
6. Rating display (5.0) on profile is static placeholder

---

## Next Sprint Priorities

1. Saved/Wishlist functionality (heart button + saved page)
2. Message filter tabs (Buying/Selling)
3. Unread message indicators
4. Sort options for listings
5. Campus and price filters

---

## Contributors

- Development: Claude AI + Human Developer
- Design: Stich UI Mockups

---

*Last Updated: January 2026 - Sprint 4 Complete*
