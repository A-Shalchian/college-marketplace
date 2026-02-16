# GBC Marketplace - Project Status

## Project Overview
A college marketplace application exclusively for George Brown College students to buy and sell items within the campus community.

**Tech Stack:** Next.js 16 | React 19 | Convex | Clerk | Tailwind CSS 4

---

## Sprint 5: Student Community Center

### Sprint Goal
Transform GBC Market from a marketplace into a full campus hub by adding events, clubs, and discussion forums where students can connect beyond buying and selling.

### Sprint Duration
February–March 2026

---

## Sprint 5 Backlog

| Feature | Priority | Description |
|---------|----------|-------------|
| **Community Hub Page** | High | Landing page at /community with tabs/sections for Events, Clubs, Forums |
| **Events — Browse & Filter** | High | Browse campus events with filters for campus, date, category |
| **Events — Create** | High | Create events with title, description, date/time, location, campus, category, image, capacity |
| **Events — Detail Page** | High | Event detail with description, location, attendee list, RSVP button |
| **Events — RSVP System** | High | Going/Interested/Not Going status per event, attendee count |
| **Events — Categories** | Medium | Study Groups, Social, Sports, Club Meetings, Workshops, Other |
| **Clubs — Browse & Search** | High | Browse/search student clubs and interest groups |
| **Clubs — Create** | High | Create a club with name, description, campus, category, cover image |
| **Clubs — Detail Page** | High | Club page with description, member count, events, discussions |
| **Clubs — Join/Leave** | High | Membership system with join/leave, member list |
| **Clubs — Member Roles** | Medium | Admin (creator) and member roles within each club |
| **Forums — Browse** | High | Discussion board with categories (Course Help, Housing, General, Campus Life) |
| **Forums — Create Post** | High | Create discussion threads with title and body |
| **Forums — Replies** | High | Threaded replies on forum posts |
| **Forums — Likes** | Medium | Like/upvote posts and replies |
| **Forums — Pin Posts** | Medium | Admins can pin important posts to the top |
| **Navbar — Community Link** | High | Add Community link to desktop and mobile navigation |
| **Community — Dark Mode** | Medium | Full dark mode support across all community pages |
| **Community — Mobile Responsive** | Medium | All community pages optimized for mobile |
| **Community — Admin Moderation** | Low | Admin ability to remove events/posts/clubs from admin dashboard |

---

## Sprint 5 — Database Schema (New Tables)

```
events                              ← NEW Sprint 5
├── organizerId (id → users)
├── title (string)
├── description (string)
├── campus (string)
├── location (string)
├── category (string: study_group | social | sports | club_meeting | workshop | other)
├── date (number — timestamp)
├── endDate (number? — timestamp)
├── maxAttendees (number?)
├── imageId (string?)
├── status (string: active | cancelled | completed)
└── createdAt (number)

eventAttendees                      ← NEW Sprint 5
├── eventId (id → events)
├── userId (id → users)
├── status (string: going | interested)
└── joinedAt (number)

clubs                               ← NEW Sprint 5
├── creatorId (id → users)
├── name (string)
├── description (string)
├── campus (string)
├── category (string)
├── imageId (string?)
├── memberCount (number)
├── status (string: active | archived)
└── createdAt (number)

clubMembers                         ← NEW Sprint 5
├── clubId (id → clubs)
├── userId (id → users)
├── role (string: admin | member)
└── joinedAt (number)

forumPosts                          ← NEW Sprint 5
├── authorId (id → users)
├── clubId (id → clubs?)            # optional — can be general or club-specific
├── title (string)
├── content (string)
├── category (string: course_help | housing | general | campus_life)
├── campus (string?)
├── isPinned (boolean)
├── replyCount (number)
├── likeCount (number)
└── createdAt (number)

forumReplies                        ← NEW Sprint 5
├── postId (id → forumPosts)
├── authorId (id → users)
├── content (string)
├── likeCount (number)
└── createdAt (number)

forumLikes                          ← NEW Sprint 5
├── userId (id → users)
├── postId (id → forumPosts?)
├── replyId (id → forumReplies?)
└── createdAt (number)
```

## Sprint 5 — New Pages & Files

```
app/community/
├── page.tsx                         # Community hub landing (tabs: Events, Clubs, Forums)
├── events/
│   ├── page.tsx                     # Browse/filter events
│   ├── create/page.tsx              # Create new event
│   └── [id]/page.tsx                # Event detail + RSVP
├── clubs/
│   ├── page.tsx                     # Browse/search clubs
│   ├── create/page.tsx              # Create new club
│   └── [id]/page.tsx                # Club detail (members, events, discussions)
└── forums/
    ├── page.tsx                     # Browse forum posts
    ├── create/page.tsx              # Create new forum post
    └── [id]/page.tsx                # Post detail + replies

convex/
├── events.ts                        # Event queries/mutations
├── clubs.ts                         # Club queries/mutations
└── forums.ts                        # Forum queries/mutations
```

---

## Sprint 4: Admin Dashboard & Content Moderation

### Sprint Goal
Build comprehensive admin dashboard for content moderation, user management, and platform safety.

### Sprint Duration
January–February 2026

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
| **Saved/Wishlist** | Heart button saves items, Saved tab on profile page | ✅ Complete |
| **Filter Tabs (Messages)** | Filter messages by All/Buying/Selling role | ✅ Complete |
| **Messages Search** | Search conversations by user name or listing title | ✅ Complete |
| **Sort Options** | Sort listings by newest, oldest, price low/high | ✅ Complete |
| **Price Range Filter** | Filter listings by min/max price | ✅ Complete |
| **Campus Maps** | Google Maps embed for campus locations on sell/listing pages | ✅ Complete |
| **Draft Listings** | Save/restore listing drafts with localStorage persistence | ✅ Complete |
| **Campus Filter** | Filter homepage listings by campus location | ✅ Complete |
| **Unread Message Badge** | Red badge on Messages link showing unread conversation count | ✅ Complete |
| **Profile Stats Cleanup** | Replaced fake 5.0 rating with real "Joined" date card | ✅ Complete |

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

## Sprint 6+ Backlog (Future)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Set Meeting Feature** | Medium | Schedule meetups with calendar integration |
| **Image Attachments in Chat** | Medium | Send photos in messages |
| **User Ratings & Reviews** | Medium | Rate buyers/sellers after transactions |
| **Push Notifications** | Medium | Real-time alerts for messages |
| **Email Notifications** | Medium | Email digest for new messages |
| **Recently Viewed** | Low | History of viewed listings |
| **Similar Listings** | Low | Recommendations based on viewing |
| **Share Listing** | Low | Share to social media |
| **Listing Expiration** | Low | Auto-hide listings after 30 days |
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
├── lastMessageAt (number)
├── buyerLastReadAt (number?)       ← Sprint 4
└── sellerLastReadAt (number?)      ← Sprint 4

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

savedListings                    ← NEW Sprint 4
├── userId (id → users)
├── listingId (id → listings)
└── savedAt (number)
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
│   ├── moderation.ts               # Content moderation utils (Sprint 4)
│   └── savedListings.ts            # Wishlist queries/mutations (Sprint 4)
├── hooks/
│   ├── use-store-user.ts           # Sync Clerk user to Convex
│   └── use-save-listing.ts         # Save/wishlist functionality (Sprint 4)
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
| Features Completed | 16 | 15 | 11 | 20 | 62 |
| Features Pending | - | - | - | - | - |
| Completion Rate | 100% | 100% | 100% | 100% | 100% |

---

## Recent Security Updates (Feb 2026)

**Critical Security Fixes:**
- Fixed admin authentication bypass (now uses server-side verification instead of client-supplied IDs)
- Added file deletion ownership verification
- Fixed settings mutations to use authenticated user context
- Added error handling to all admin operations
- Limited database queries to prevent performance issues

---

## Known Issues

1. Set Meeting button is placeholder UI
2. Image/attachment button in chat is placeholder UI
3. Load More Items button is placeholder UI

---

## Next Sprint Priorities (Sprint 5)

1. Community hub landing page with Events/Clubs/Forums tabs
2. Events system — create, browse, RSVP, filter by campus/date/category
3. Clubs system — create, browse, join/leave, member roles
4. Discussion forums — posts, replies, likes, categories
5. Navbar integration — Community link in desktop and mobile nav

---

## Contributors

- Development: Radin MadadNezhad Aligorkeh + Arash Shalchian + Diana Mohammadi
- Design: Stich UI Mockups

---

*Last Updated: February 2026 - Sprint 4 Complete (20/20) | Sprint 5 Planned (Student Community Center)*
