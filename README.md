# ✈️ Lynkerr - Mini Travel Experience Listing Platform

> **Full-Stack Technical Challenge Submission**

A sleek, modern marketplace-style web application where users can discover, share, and save curated travel experiences from around the world.

**🌐 Live Demo: [lynkerrtravel.vercel.app](http://lynkerrtravel.vercel.app/)**


---

## 📖 Project Overview

**Lynkerr** is a full-stack travel experience listing platform built as a mini-marketplace. The application allows users to register and log in, after which they can publish richly detailed travel experience listings complete with a cover image, location, short preview, full description, and a price. A public experience feed (accessible to anyone) displays all listings in reverse-chronological order, showing each creator's name and the posting date. Clicking any listing navigates to a dedicated detail page with the full itinerary. Logged-in users can also save experiences to a personal wishlist, manage their own listings via a personal hub, and edit or delete listings they own. As a bonus, both the Create and Edit Listing forms feature a **"Magic AI Rewrite"** button powered by the **Gemini 2.5 Flash** API, which can upgrade draft copy into polished, publication-ready language.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Why It Was Used |
|---|---|
| **Next.js 16 (App Router)** | Industry-standard React framework with file-based routing, server-side capability, and built-in API routes. It is ideal for a full-stack app in a single repository. |
| **React 19** | The component model enables declarative, reusable UI building blocks like `ListingCard` and `Navbar`. |
| **TypeScript** | Provides static type safety across the entire codebase, catching errors at compile time and improving maintainability. |
| **Tailwind CSS v4** | Utility-first CSS enables rapid, design-consistent UI development. The cutting-edge v4 (PostCSS plugin) was used alongside a modern dark glassmorphism aesthetic. |
| **Geist Font (next/font)** | The Geist Sans and Geist Mono fonts from Vercel are loaded via `next/font/google` for zero layout shift and optimal performance. |

### Backend & API
| Technology | Why It Was Used |
|---|---|
| **Next.js API Routes** | The `/api/enhance` route acts as a secure server-side proxy to the Gemini AI API, keeping the API key out of the browser. |
| **Google Gemini 2.5 Flash** | Powers the "Magic AI Rewrite" feature, acting as an expert travel copywriter that rewrites draft descriptions into polished, professional language. |

### Database & Auth
| Technology | Why It Was Used |
|---|---|
| **Supabase (PostgreSQL)** | A single Backend-as-a-Service platform providing both the PostgreSQL database and authentication. Supabase's JavaScript client enables real-time, direct database queries from client components without a separate custom backend, significantly cutting development time. |
| **Supabase Auth** | Provides email/password authentication with a persistent JWT session. Supabase's `onAuthStateChange` listener keeps the Navbar in sync with auth state reactively. |
| **Supabase Storage** | A dedicated `listing-images` bucket stores user-uploaded cover photos, returning a public CDN URL that is saved in the database. |
| **Row Level Security (RLS)** | Database-level security policies enforce that only authenticated users can create listings, and only owners can update or delete their own records. This makes the app secure by default. |

---

## ⚙️ Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A [Supabase](https://supabase.com/) account and project
- A [Google AI Studio](https://aistudio.google.com/) API key (for the AI Rewrite feature)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/mohrashard/travel-platform.git
cd travel-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the Supabase Database

Go to your Supabase project's **SQL Editor** and run the following schema script to create the required tables, enable Row Level Security, and configure the storage bucket:

```sql
-- 1. Create the 'listings' table
CREATE TABLE public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    price NUMERIC,
    creator_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Create the 'saved_listings' table
CREATE TABLE public.saved_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, listing_id)
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own saves" ON public.saved_listings FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read saves" ON public.saved_listings FOR SELECT USING (true);

-- 3. Create a Storage Bucket for Images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);
CREATE POLICY "Images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload images." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images');
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase - find these in your project's Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI - for the "Magic AI Rewrite" feature
# Get your key from https://aistudio.google.com/
GEMINI_API_KEY=your-gemini-api-key
```

> **Note:** If you do not have a Gemini API key, the application will still run in full. The AI Rewrite button will simply return an error if clicked.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## ✅ Features Implemented

### Core Features

- **🔐 Secure User Registration** - Sign up with display name, email, and password. I implemented a robust password policy (8+ characters, at least one number, and one symbol) for enhanced security.
- **🔑 User Login / Logout** - Email/password authentication using `signInWithPassword`. Auth state is synced reactively via `onAuthStateChange` in the Navbar.
- **📋 Public Experience Feed** - The `/feed` page displays all listings in reverse-chronological order (newest first). Each card shows the listing image, title, location, price, creator's name with an avatar, and the posting date.
- **✍️ Create a Listing** - Authenticated users can publish a new experience with: Title, Location, Cover Image (file upload), Short Description (max 150 chars with live counter), Full Description, and Price.
- **🔍 Listing Detail Page** - Clicking any card navigates to `/feed/[id]`, displaying the full cover image, title, location badge, host info, price, and the complete full description.

### Optional / Advanced Features

- **✨ AI-Powered Copy Enhancement** - A "Magic AI Rewrite" button on both Create and Edit forms calls the server-side `/api/enhance` route. This uses the **Google Gemini 2.5 Flash** model to rewrite draft titles and descriptions into polished, professional travel copy.
- **🔎 Real-time Search & Filtering** - The feed, "My Listings", and "Saved" pages include a debounced (500ms) search bar that filters results by `title` or `location`.
- **📄 Glitch-Free Pagination** - All listing grids implement stable cursor-based pagination. I refactored the fetch logic to prevent state loops and ensure infinite scroll/load more works reliably even during active searches.
- **🖼️ Image File Uploads** - Images are uploaded directly to a Supabase Storage bucket (`listing-images`) and mapped to the database.
- **✏️ Edit Listings** - Creators can edit their listings via `/edit/[id]`. Ownership is verified both in the UI and at the database level via RLS policies.
- **🗑️ Delete Listings** - Creators can remove their own listings with a double-confirmation flow to prevent accidental deletion.
- **❤️ Personal Saved List** - Users can save experiences to a personal collection, which is viewable in the "Saved" dashboard.
- **⚡ Performance & SEO** - Implemented explicit metadata for favicon cache-busting and defined custom brand icons (icon.png) to ensure the platform looks professional from the tab up.
- **� Fully Responsive Navbar** - Built a custom mobile navigation with an animated hamburger menu and transparent backdrop blur for a premium mobile experience.
- **💀 Skeleton Loading States** - Animated placeholder cards provide a smooth transition while content is loading.
- **🎨 Premium Dark UI** - A consistent "2030" aesthetic with deep dark backgrounds (`#030712`), frosted glass components, and vibrant gradient highlights.

---

## 🏛️ Architecture & Key Decisions

### Why This Stack?

This stack was chosen for maximum development velocity without sacrificing quality or scalability. **Next.js** handles both the frontend rendering and the backend API in a single codebase, eliminating the need to set up and manage a separate Express or FastAPI server. **Supabase** replaces an entire backend layer, providing a production-grade PostgreSQL database, authentication system, file storage, and a type-safe JavaScript client, all on a generous free tier. This pairing is a modern, industry-proven pattern for shipping full-stack apps rapidly and professionally.

### How Authentication Works

Authentication is handled entirely by **Supabase Auth** using email/password credentials.

1. **Registration:** The `register` page calls `supabase.auth.signUp()`, passing the email, password, and `display_name` (stored in `user_metadata`). On success, the user is redirected to the feed.
2. **Login:** The `login` page calls `supabase.auth.signInWithPassword()`. Supabase stores a JWT session in the browser's `localStorage` automatically.
3. **Session Persistence:** The `Navbar` (a client component) calls `supabase.auth.getSession()` on mount and subscribes to `supabase.auth.onAuthStateChange()`. This ensures auth-dependent UI (like "My Listings", "Create Listing", and "Sign Out") renders correctly and updates instantly on login or logout, without a page refresh.
4. **Route Protection:** The Create Listing (`/create`) and Edit Listing (`/edit/[id]`) pages check for a valid session on mount and programmatically redirect to `/login` if none is found, providing client-side route guarding.
5. **Data Security:** Row Level Security (RLS) policies on the Supabase `listings` table form the last line of defence, ensuring database-level enforcement that users can only mutate records they own, regardless of client-side state.

### How Listings Are Stored

Listings are stored in a single `public.listings` PostgreSQL table with the following key columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | Auto-generated primary key |
| `created_at` | `TIMESTAMPTZ` | Used for ordering the feed (newest first) |
| `title` | `TEXT` | The listing title |
| `location` | `TEXT` | The destination, used for display and search |
| `image_url` | `TEXT` | Public CDN URL from Supabase Storage |
| `short_description` | `TEXT` | Feed card preview (max 150 chars enforced in UI) |
| `full_description` | `TEXT` | Full detail shown on the listing page |
| `price` | `NUMERIC` | Price in USD |
| `creator_name` | `TEXT` | Denormalized from auth metadata at creation time |
| `user_id` | `UUID` | Foreign key to `auth.users`, used for ownership checks |

A separate `public.saved_listings` junction table manages the many-to-many relationship between users and their saved listings, with a `UNIQUE(user_id, listing_id)` constraint to prevent duplicate saves.

### If I Had More Time

The most impactful next feature would be a **full booking and payment system**. Currently, the listing detail page shows a "Book Experience" CTA button that is a UI placeholder. Integrating **Stripe Checkout** or **Pay here** would allow users to purchase experiences directly on the platform, turning it from a pure listing directory into a true marketplace. This would require a new `bookings` table, a Stripe webhook handler, and a dashboard for creators to track their revenues and reservations, forming the commercial backbone of the platform.

---

## 💡 Product Thinking: Scaling to 10,000 Listings

*If this platform grew to 10,000 travel listings, what changes would I make to improve performance and user experience?*

At 10,000 listings, the current "Load More" pagination would still function, but several structural improvements would dramatically improve performance and UX. First, I would add **database indexes** on the `location`, `title`, and `created_at` columns in Supabase. `created_at` is already the primary sort key, and full text search queries on `location` and `title` would benefit enormously from GIN or B-tree indexes, reducing query time from sequential scans to microseconds. Second, I would migrate the search from a basic `ilike` to **Supabase's built-in Full Text Search** (`to_tsvector` / `to_tsquery`), enabling ranked relevance, partial matching, and stemming for a far superior search experience. Third, I would introduce robust **filtering UI**, allowing users to filter by price range, continent/country, or category (adventure, culture, food, etc.) with all filters applied server-side for efficiency. Fourth, for the public feed specifically, I would leverage **Next.js ISR (Incremental Static Regeneration)** or the Next.js `fetch` cache with a short revalidation window (e.g., every 60 seconds) to serve pre-rendered HTML for the first page of the feed from the CDN edge, eliminating database round-trips for the majority of page views. Fifth, as the dataset grew further, I would introduce a **Redis caching layer** (e.g., via Upstash) in the `/api` route to cache popular search queries and the top listing results for frequently-browsed locations, serving these responses in under 5ms without touching the database. Taken together, these changes - indexing, full-text search, ISR, and caching - would maintain sub-100ms response times and a fluid user experience even as the catalogue scaled by an order of magnitude.

---

## 📁 Project Structure

```
travel-platform/
├── app/
│   ├── api/
│   │   └── enhance/          # POST /api/enhance - Gemini AI rewrite endpoint
│   │       └── route.ts
│   ├── create/               # Create a new listing (auth-protected)
│   │   └── page.tsx
│   ├── edit/[id]/            # Edit an existing listing (owner-only)
│   │   └── page.tsx
│   ├── feed/
│   │   ├── [id]/             # Individual listing detail page
│   │   │   └── page.tsx
│   │   └── page.tsx          # Public experience feed with search & pagination
│   ├── login/                # Login page
│   │   └── page.tsx
│   ├── my-listings/          # User's personal listings dashboard
│   │   └── page.tsx
│   ├── register/             # Registration page
│   │   └── page.tsx
│   ├── saved/                # User's saved/wishlisted experiences
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx            # Root layout with Navbar
│   └── page.tsx              # Landing / Hero page
├── components/
│   ├── ListingCard.tsx       # Reusable listing card (feed, my-listings, saved)
│   └── Navbar.tsx            # Reactive navbar with auth-aware links
├── utils/
│   └── supabase/
│       └── client.ts         # Supabase client singleton
├── tables.txt                # SQL schema for Supabase setup
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🚀 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code quality checks |

---

## 👨‍💻 Beyond the Intern Title: What I Bring to Lynkerr

I am a product-driven software engineer with a builder's mindset. I designed, coded, and shipped this entire platform - complete with AI-powered features, real-time search, and full CRUD capabilities - from scratch in under 3 hours. Not a tutorial project. Not a template. A production-grade, fully functional marketplace.

### The Architect's Mindset: Code and Test

I don't just write code that "works." I architect systems that are built to last. For this challenge, I prioritized a stack (Next.js and Supabase) that provides the perfect balance of speed, security, and scalability. I am a firm believer that a developer's job includes ensuring stability through rigorous logic and testing. Whether it is refactoring pagination to eliminate state glitches or implementing client-side validation to prevent bad data from reaching the DB, I treat every edge case as a priority. This is the exact stack that companies like Vercel, Linear, and Loom use in production.

### Beyond Standard Web Development

I don't write boilerplate. I build intelligent systems. Coming from a First-Class Honors background in Software Engineering, my technical scope extends far beyond standard web development. I have deep practical knowledge in AI and Machine Learning - from leveraging Python for data pipelines to integrating advanced LLMs directly into production applications. The **Gemini 2.5 Flash AI rewrite feature** built into this very challenge is a live example: a server-side API proxy that acts as an expert travel copywriter, a feature that demonstrates my ability to integrate complex third-party intelligence.

### Rapid Execution Without Cutting Corners

I specialize in taking complex ideas from zero to a fully deployed MVP in 48 hours without sacrificing code quality, UI/UX, or scalability. Every page in this application has skeleton loading states, debounced search, Row Level Security enforced at the database level, mobile-responsive layouts, and a premium glassmorphism design system - because those details matter, and I don't skip them.

### What I Will Do at Lynkerr

My goal isn't to close assigned tickets or fix minor bugs. I am bringing my full technical stack, fresh product ideas, and the ability to execute with a senior-level mindset from day one. I am ready to take extreme ownership of features, architect scalable systems, and actively contribute to pushing Lynkerr's vision forward - not just as an intern, but as someone who builds things that last.

You can explore my full portfolio, AI projects, and tech stack at **[mohamedrashard.dev](https://www.mohamedrashard.dev/)**.

---

*Built with ❤️ as a Full-Stack Technical Challenge for Lynkerr.*
