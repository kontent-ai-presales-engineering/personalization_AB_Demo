# Campground Directory POC - Implementation Plan

## Overview

This document outlines the implementation plan for building a proof-of-concept campground directory that demonstrates low-maintenance integration patterns for evaluating Kontent.ai headless CMS.

**Current Stack:** React Router 7 + Vite + Tailwind CSS  
**Deployment:** Vercel (serverless functions)  
**Architecture Pattern:** Runtime Composition (CMS + APIs composed at runtime)

---

## Architecture Decisions

### Framework Choice
**Decision:** Adapt spec to React Router (current stack) rather than migrating to Next.js
- **Rationale:** Existing codebase is React Router + Vite, migration would be disruptive
- **Path Adaptation:** `/app/search` → `/search`, `/app/campground/[slug]` → `/campgrounds/:slug`
- **Note:** If Next.js migration is required, Phase 0 migration step would be needed

### Data Flow Pattern
```
Search Page: Algolia (pre-populated) → No CMS calls
Detail Page: Kontent.ai Delivery API → Client-side rendering (optimized)
Enrichment: Google Ratings API (cached) + Mock K2 PMS API
```

### Algolia Sync
**Note:** Algolia sync functions are deployed in Netlify cloud and automatically triggered by Kontent.ai webhooks. No local sync code needed - index is pre-populated.

---

## Phase 1: Core Search & Detail Pages

### 1.1 Algolia Configuration & Setup

**Files to Create:**
- `src/config/algolia.ts` - Algolia client configuration
- `src/types/algolia.ts` - TypeScript types for Algolia search results

**Tasks:**
- [ ] Install `algoliasearch` and `react-instantsearch-hooks-web` packages
- [ ] Create Algolia client with app ID and search key (read-only)
- [ ] Define TypeScript interfaces matching Algolia index structure:
  - `campground_name`, `city`, `state`, `zip`, `description`
  - `latitude`, `longitude`
  - `amenities[]`, `ways_to_stay[]`, `region`
  - `google_place_id`
- [ ] Export search client and configuration

**Maintenance Note:** Zero maintenance - Algolia index is pre-populated, read-only access

---

### 1.2 Search Page (`/search`)

**Files to Create:**
- `src/pages/SearchPage.tsx` - Main search page component
- `src/components/search/SearchBox.tsx` - Search input component
- `src/components/search/FacetFilters.tsx` - Faceted filter sidebar
- `src/components/search/CampgroundResultCard.tsx` - Individual result card
- `src/components/search/ResultsGrid.tsx` - Grid layout for results

**Tasks:**
- [ ] Create search page route in `main.tsx` (`path: "search"`)
- [ ] Set up Algolia InstantSearch provider with hooks
- [ ] Implement search box with real-time search
- [ ] Build faceted filters for:
  - State (dropdown or multi-select)
  - City (dropdown or multi-select)
  - Amenities (checkboxes)
  - Ways to Stay (checkboxes)
  - Region (dropdown or multi-select)
- [ ] Create result card component displaying:
  - Campground name
  - City, State
  - Description (truncated)
  - Amenities badges
  - Link to detail page
- [ ] Implement results grid with responsive layout
- [ ] Add empty state when no results
- [ ] Add loading state during search
- [ ] Handle URL state synchronization (search params in URL)

**Key Features:**
- Real-time search as user types
- Multiple active filters simultaneously
- URL reflects current search/filter state
- Mobile-responsive grid layout
- No calls to Kontent.ai - all data from Algolia

**Maintenance Note:** Zero maintenance - Algolia handles search, filtering, and indexing

---

### 1.3 Enhanced Campground Detail Page

**Files to Modify:**
- `src/pages/CampgroundDetailPage.tsx` - Enhance existing detail page

**Files to Create:**
- `src/components/campgrounds/VimeoEmbed.tsx` - Vimeo video embed component

**Tasks:**
- [ ] Regenerate TypeScript models to include region field (`npm run model:generate`)
- [ ] Verify existing detail page fetches from Kontent.ai by slug
- [ ] Ensure all required fields display:
  - Name, address, phone, email
  - Full description (banner_body HTML rendering)
  - Amenities list (taxonomy display)
  - Ways to stay (taxonomy display)
  - Region (if available in model)
- [ ] Extract Vimeo video ID from `book_now_cta_background_video_link` field (or custom element when added)
- [ ] Create Vimeo embed component with aspect-video container
- [ ] Add Vimeo embed to detail page (if video URL exists)
- [ ] Optimize client-side fetching with React Query caching
- [ ] Add proper error handling for missing campgrounds
- [ ] Add loading states

**Vimeo Implementation:**
- Extract video ID from URL pattern: `https://vimeo.com/{id}` or `https://player.vimeo.com/video/{id}`
- Use iframe embed: `https://player.vimeo.com/video/{id}`
- Container: `aspect-video` Tailwind class for 16:9 ratio

**Maintenance Note:** Low maintenance - Kontent.ai content updates automatically, Vimeo embed is standard

---

## Phase 2: Runtime Enrichment

### 2.1 Google Ratings API Route

**Files to Create:**
- `api/google-ratings/route.ts` - Edge API route for Google Places API

**Tasks:**
- [ ] Create Vercel serverless function in `api/google-ratings/route.ts`
- [ ] Accept `placeId` query parameter
- [ ] Implement 24-hour in-memory cache:
  - Use `Map<string, { data: RatingData, timestamp: number }>`
  - Check cache before API call
  - Store response with current timestamp
  - Expire entries older than 24 hours
- [ ] Fetch from Google Places API Place Details endpoint:
  - Endpoint: `https://maps.googleapis.com/maps/api/place/details/json`
  - Required fields: `rating`, `user_ratings_total`, `reviews`
  - Use `GOOGLE_PLACES_API_KEY` environment variable (server-side only)
- [ ] Return structured response:
  ```typescript
  {
    rating: number,
    user_ratings_total: number,
    reviews: Array<{ author_name: string, text: string, rating: number }>
  }
  ```
- [ ] Implement graceful fallback:
  - Return `null` or empty object if Place ID missing
  - Return cached data if API fails
  - Log errors but don't throw
- [ ] Add error handling for API failures
- [ ] Add rate limiting considerations (document in comments)

**Cache Strategy:**
- In-memory cache per serverless function instance
- Cache key: `placeId`
- TTL: 24 hours (86400000 ms)
- Cache invalidation: Automatic on TTL expiry

**Maintenance Note:** Low maintenance (~$3/mo) - 24h cache minimizes API calls, graceful degradation

---

### 2.2 Google Ratings Display Component

**Files to Create:**
- `src/components/campgrounds/GoogleRatings.tsx` - Client component for ratings display

**Tasks:**
- [ ] Create client component that fetches from `/api/google-ratings?placeId=...`
- [ ] Use React Query for data fetching and caching
- [ ] Display star rating (use star icons or Unicode stars)
- [ ] Display review count (e.g., "4.5 ⭐ (123 reviews)")
- [ ] Handle loading state (skeleton or spinner)
- [ ] Handle error state gracefully (don't break page if ratings fail)
- [ ] Only render if `google_place_id` exists in campground data
- [ ] Add to detail page below contact information

**UI Design:**
- Star rating: Visual stars (filled/empty) or text-based
- Review count: Link-style or badge
- Loading: Subtle spinner or skeleton
- Error: Hide component or show "Ratings unavailable"

**Maintenance Note:** Low maintenance - Component handles errors gracefully, API route has caching

---

### 2.3 Mock K2 PMS API Route

**Files to Create:**
- `api/availability/route.ts` - Edge API route for mock availability data

**Tasks:**
- [ ] Create Vercel serverless function in `api/availability/route.ts`
- [ ] Accept query parameters:
  - `campgroundId` (string) - Kontent.ai codename or ID
  - `checkIn` (ISO date string) - Check-in date
  - `checkOut` (optional, ISO date string) - Check-out date
- [ ] Simulate 200ms latency with `setTimeout` or `delay` utility
- [ ] Return mock data structure:
  ```typescript
  {
    available: boolean,
    siteTypes: Array<{
      name: string,
      price: number,
      available: boolean
    }>,
    checkIn: string,
    checkOut: string
  }
  ```
- [ ] Generate realistic mock data:
  - Random availability (70% chance available)
  - 3-5 site types (RV Sites, Tent Sites, Cabins, etc.)
  - Price range: $30-$150 per night
  - Some sites marked unavailable
- [ ] Add extensive comments:
  - "Replace with real K2 API when credentials available"
  - "Expected K2 API endpoint: ..."
  - "Expected request format: ..."
  - "Expected response format: ..."
- [ ] Add error handling for invalid dates
- [ ] Validate date parameters

**Mock Data Examples:**
- Site types: "RV Site (Full Hookup)", "Tent Site", "Cabin", "Glamping Tent"
- Prices: Random between $30-$150
- Availability: Random boolean per site type

**Maintenance Note:** Bounded maintenance - Partner swaps mock for real API when ready

---

### 2.4 Availability Checker Component

**Files to Create:**
- `src/components/campgrounds/AvailabilityChecker.tsx` - Client component for availability

**Tasks:**
- [ ] Create client component with date inputs
- [ ] Use HTML5 date inputs for check-in and check-out
- [ ] Add "Check Availability" button
- [ ] Fetch from `/api/availability?campgroundId=...&checkIn=...&checkOut=...`
- [ ] Display site types and pricing in a card/list format
- [ ] Show availability status per site type (available/unavailable badges)
- [ ] Display disclaimer: "Simulated data - K2 integration pending"
- [ ] Handle loading state
- [ ] Handle error state gracefully
- [ ] Add to detail page below ratings component
- [ ] Validate dates (check-out after check-in)

**UI Design:**
- Date inputs: Side-by-side on desktop, stacked on mobile
- Results: Card layout with site name, price, availability badge
- Disclaimer: Small text below results, styled as info/notice
- Loading: Skeleton cards or spinner

**Maintenance Note:** Bounded maintenance - Component ready for real API swap

---

## Phase 3: Map View (Nice-to-Have)

### 3.1 Google Maps Integration Setup

**Files to Modify:**
- `index.html` - Add Google Maps script tag

**Tasks:**
- [ ] Add Google Maps JavaScript API script to `index.html`
- [ ] Use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable
- [ ] Load script with callback for initialization
- [ ] Add script loading error handling

**Script Loading:**
```html
<script
  src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`}
  async
  defer
></script>
```

---

### 3.2 Map View Component

**Files to Create:**
- `src/components/search/MapView.tsx` - Google Maps component
- `src/hooks/useGoogleMaps.ts` - Hook for Google Maps initialization

**Tasks:**
- [ ] Create hook to check if Google Maps is loaded
- [ ] Create MapView component that:
  - Initializes Google Map in a container
  - Accepts array of campground results from Algolia
  - Creates markers for each campground using lat/long
  - Sets up info windows with campground card preview
  - Auto-fits bounds to show all markers
  - Handles marker click → show info window
- [ ] Info window content:
  - Campground name
  - City, State
  - Link to detail page
  - Small image (if available)
- [ ] Handle edge cases:
  - No results
  - Missing coordinates
  - Map initialization failure

**Map Features:**
- Markers: Custom or default Google markers
- Info windows: Click marker to open
- Auto-fit bounds: Show all results on initial load
- Responsive: Full width container, height: 600px

---

### 3.3 List/Map View Toggle

**Files to Modify:**
- `src/pages/SearchPage.tsx` - Add view toggle

**Tasks:**
- [ ] Add toggle button/switch: "List View" / "Map View"
- [ ] Manage view state (list vs map)
- [ ] Conditionally render ResultsGrid or MapView
- [ ] Share search/filter state between views
- [ ] Update URL param to reflect view mode (optional)
- [ ] Ensure map updates when filters change

**UI Design:**
- Toggle: Button group or switch above results
- Position: Top-right of results area
- Icons: List icon and Map icon (optional)

**Maintenance Note:** Low maintenance - Google Maps handles map rendering, markers update with search results

---

## Environment Variables Setup

### Required Variables

Create `.env` file (or update existing) with:

```bash
# Kontent.ai
VITE_ENVIRONMENT_ID=your_environment_id
VITE_PREVIEW_API_KEY=your_preview_api_key

# Algolia (Public - safe for client-side)
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_SEARCH_KEY=your_algolia_search_key

# Google Places API (Server-side only)
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Google Maps API (Public - for map view)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Security Notes:**
- Algolia search key: Read-only, safe for client-side
- Google Places API key: Server-side only (in API route)
- Google Maps API key: Public, but restrict by domain in Google Cloud Console

---

## File Structure

```
personalization_AB_Demo/
├── api/
│   ├── google-ratings/
│   │   └── route.ts          # NEW: Google Ratings API route
│   └── availability/
│       └── route.ts          # NEW: Mock K2 PMS API route
├── src/
│   ├── components/
│   │   ├── campgrounds/
│   │   │   ├── GoogleRatings.tsx        # NEW: Ratings display
│   │   │   ├── AvailabilityChecker.tsx  # NEW: Availability checker
│   │   │   └── VimeoEmbed.tsx           # NEW: Vimeo embed
│   │   └── search/
│   │       ├── SearchBox.tsx             # NEW: Search input
│   │       ├── FacetFilters.tsx         # NEW: Filter sidebar
│   │       ├── CampgroundResultCard.tsx  # NEW: Result card
│   │       ├── ResultsGrid.tsx          # NEW: Results grid
│   │       └── MapView.tsx              # NEW: Map view (Phase 3)
│   ├── config/
│   │   └── algolia.ts                   # NEW: Algolia config
│   ├── hooks/
│   │   └── useGoogleMaps.ts             # NEW: Maps hook (Phase 3)
│   ├── pages/
│   │   ├── SearchPage.tsx               # NEW: Search page
│   │   └── CampgroundDetailPage.tsx     # MODIFY: Enhance existing
│   ├── types/
│   │   └── algolia.ts                   # NEW: Algolia types
│   └── main.tsx                         # MODIFY: Add search route
├── index.html                            # MODIFY: Add Google Maps script (Phase 3)
└── package.json                          # MODIFY: Add dependencies
```

---

## Dependencies to Install

```bash
npm install algoliasearch react-instantsearch-hooks-web
```

**Optional (for Phase 3):**
- Google Maps types: `@types/google.maps` (if using TypeScript definitions)

---

## Implementation Order

### Week 1: Phase 1 (Core Search & Detail)
1. Day 1-2: Algolia setup + Search page structure
2. Day 3: Faceted filters implementation
3. Day 4: Result cards + grid layout
4. Day 5: Detail page enhancements + Vimeo embed

### Week 2: Phase 2 (Runtime Enrichment)
1. Day 1: Google Ratings API route + caching
2. Day 2: Google Ratings display component
3. Day 3: Mock K2 PMS API route
4. Day 4: Availability checker component
5. Day 5: Integration testing + polish

### Week 3: Phase 3 (Map View - Optional)
1. Day 1-2: Google Maps setup + MapView component
2. Day 3: List/Map toggle + state management
3. Day 4: Info windows + marker interactions
4. Day 5: Testing + responsive design

---

## Testing Checklist

### Phase 1
- [ ] Search returns results from Algolia
- [ ] Filters work independently and together
- [ ] URL reflects search/filter state
- [ ] Result cards link to correct detail pages
- [ ] Detail page displays all campground data
- [ ] Vimeo embed works (if video URL present)
- [ ] Mobile responsive

### Phase 2
- [ ] Google Ratings API returns cached data after first call
- [ ] Ratings display shows stars and review count
- [ ] Ratings gracefully handle missing Place ID
- [ ] Availability API returns mock data with 200ms delay
- [ ] Availability checker validates dates
- [ ] Availability displays site types and prices
- [ ] Disclaimer visible

### Phase 3
- [ ] Map loads and displays markers
- [ ] Markers positioned correctly using lat/long
- [ ] Info windows show campground preview
- [ ] List/Map toggle works
- [ ] Map updates when filters change
- [ ] Auto-fit bounds works correctly

---

## Success Criteria Validation

Demo user should be able to:
1. ✅ Search "campgrounds in Texas" → Algolia returns filtered results
2. ✅ Filter by amenities (pool, wifi, etc.) → Results update in real-time
3. ✅ Toggle list/map view → Both views work (if Phase 3 completed)
4. ✅ Click campground → See full details from Kontent.ai
5. ✅ See Google star rating + review count → Ratings component displays
6. ✅ Check mock availability for dates → Availability checker shows mock data
7. ✅ Watch Vimeo video → Video embeds if URL present

**Demo Duration:** 5-7 minutes of interaction

---

## Maintenance Burden Summary

| Integration | Maintenance Level | Notes |
|------------|------------------|-------|
| Algolia Search | Zero | Pre-populated index, read-only access |
| Kontent.ai CMS | Zero | Content updates automatically |
| Google Ratings | Low (~$3/mo) | 24h cache minimizes API calls |
| K2 PMS | Bounded | Mock ready for real API swap |
| Google Maps | Low | Standard integration, markers from Algolia |

---

## Notes & Considerations

### Performance
- Algolia search is fast (sub-100ms typically)
- Google Ratings cache reduces API calls significantly
- Mock K2 API simulates realistic latency
- Map view may be slower with many markers (consider clustering if 50+ results)

### Error Handling
- All API calls have graceful fallbacks
- Missing data never breaks the UI
- Loading states for all async operations
- Error states are user-friendly

### Mobile Responsiveness
- Search filters: Collapsible sidebar on mobile
- Results grid: 1 column on mobile, 2-3 on tablet, 3-4 on desktop
- Map view: Full width, touch-friendly markers
- Detail page: Stacked layout on mobile

### Accessibility
- Search box: Proper ARIA labels
- Filters: Keyboard navigable
- Result cards: Semantic HTML, proper heading hierarchy
- Map: Keyboard navigation support (if possible)

---

## Next Steps After Implementation

1. **Content Setup:** Ensure Algolia index is populated with campground data
2. **Environment Variables:** Set all required API keys in Vercel
3. **Testing:** Run through demo flow end-to-end
4. **Documentation:** Update README with setup instructions
5. **Demo Prep:** Prepare 5-7 minute demo script

---

## Clarifications Resolved

1. ✅ **Framework:** Keep React Router + Vite (no Next.js migration)
2. ✅ **Algolia Sync:** Functions exist in Netlify cloud, triggered by Kontent.ai webhooks (no action needed)
3. ✅ **Vimeo Field:** Custom element will be added to content model; use `book_now_cta_background_video_link` for now
4. ✅ **Region Field:** Exists in content model - need to regenerate TypeScript models
5. ✅ **Rendering:** Client-side rendering is fine, optimize for load speed

---

## Appendix: Code Patterns

### Algolia Search Hook Pattern
```typescript
import { useSearchBox, useHits, useRefinementList } from 'react-instantsearch-hooks-web';

function SearchPage() {
  const { query, refine } = useSearchBox();
  const { hits } = useHits();
  const { items: amenities, refine: refineAmenities } = useRefinementList({ attribute: 'amenities' });
  // ...
}
```

### Google Ratings Cache Pattern
```typescript
const cache = new Map<string, { data: RatingData, timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedRating(placeId: string) {
  const cached = cache.get(placeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### Mock API Delay Pattern
```typescript
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  await delay(200); // Simulate API latency
  return Response.json(mockData);
}
```

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Ready for Implementation

