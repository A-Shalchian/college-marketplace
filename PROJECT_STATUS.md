# GBC Marketplace - Project Status

## Project Overview
A college marketplace application exclusively for George Brown College students to buy and sell items within the campus community.

**Tech Stack:** Next.js 15 | React 19 | Convex | Clerk | Tailwind CSS 4

---

## Sprint 2: UI/UX Overhaul

### Sprint Goal
Redesign the entire application with a modern, polished UI based on custom Stich designs. Add campus location support and improve mobile experience.

### Sprint Duration
January 2026

---

## Sprint 2 Completed Features

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

## Sprint 3 Backlog (Next Up)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Profile Page Redesign** | High | Update profile page with new Stich design |
| **Edit Listing Redesign** | High | Match edit page to new create listing design |
| **Saved/Wishlist Listings** | High | Save button functionality, saved items page |
| **Filter Tabs (Buying/Selling)** | High | Filter messages by transaction role |
| **Sort Options** | High | Sort listings by newest, price low-high, etc. |
| **Price Range Filter** | High | Filter by min/max price |
| **Campus Filter** | High | Filter listings by campus location |
| **Unread Message Badge** | High | Show unread count on messages icon |

---

## Sprint 4+ Backlog (Future)

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
| **Dark Mode** | Low | Theme toggle |
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
└── createdAt (number)

listings
├── sellerId (id → users)
├── title (string)
├── description (string)
├── price (number)
├── category (string)
├── condition (string)
├── campus (string)          ← NEW
├── images (string[])
├── status (string: active | sold | removed)
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
│   ├── profile/page.tsx            # User profile
│   ├── messages/
│   │   ├── page.tsx                # Conversations list (redesigned)
│   │   └── [id]/page.tsx           # Chat thread (redesigned)
│   ├── listings/
│   │   └── [id]/
│   │       ├── page.tsx            # Listing detail (redesigned)
│   │       └── edit/page.tsx       # Edit listing
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   ├── navbar.tsx                  # Top navigation
│   ├── footer.tsx                  # Site footer (new)
│   ├── bottom-nav.tsx              # Mobile bottom nav (new)
│   ├── mobile-search.tsx           # Mobile search (new)
│   ├── listing-card.tsx            # Listing grid card
│   ├── category-filter.tsx         # Category tabs
│   └── providers/
│       └── convex-provider.tsx
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── users.ts                    # User queries/mutations
│   ├── listings.ts                 # Listing queries/mutations
│   ├── messages.ts                 # Messaging queries/mutations
│   └── files.ts                    # File upload
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

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | #28618a | Buttons, links, accents |
| `accent-mint` | #3ab795 | Success, available badges |
| `accent-coral` | #e85d5d | Errors, delete actions |
| `background` | #f8f8f8 | Page backgrounds |
| `foreground` | #1a1a1a | Primary text |

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
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

App runs at: http://localhost:3000

---

## Sprint Metrics

| Metric | Sprint 1 | Sprint 2 | Total |
|--------|----------|----------|-------|
| Features Completed | 16 | 15 | 31 |
| Features Pending | - | - | 16 |
| Completion Rate | 100% | 100% | 66% |

---

## Known Issues

1. Filter tabs (All/Buying/Selling) in messages are placeholder UI
2. Set Meeting button is placeholder UI
3. Image/attachment button in chat is placeholder UI
4. Search in messages sidebar is placeholder UI

---

## Next Sprint Priorities

1. Profile page redesign with Stich design
2. Edit listing page redesign
3. Saved/Wishlist functionality
4. Message filter tabs (Buying/Selling)
5. Unread message indicators

---

## Contributors

- Development: Claude AI + Human Developer
- Design: Stich UI Mockups

---

*Last Updated: January 2026 - Sprint 2 Complete*
