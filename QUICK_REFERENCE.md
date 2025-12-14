# Quick Reference Guide

## Architecture at a Glance

```
Frontend (React Router 7 + Vite)
    ├── Search Page → Algolia InstantSearch
    ├── Detail Page → Kontent.ai Delivery API
    └── Map View → Google Maps JavaScript API

Backend (Vercel Serverless Functions)
    ├── /api/google-ratings → Google Places API (cached)
    └── /api/availability → Mock K2 PMS (ready for swap)
```

## Key Integrations

| Service | Purpose | Location | Caching |
|---------|---------|----------|---------|
| **Algolia** | Search & filtering | Client-side | Built-in |
| **Kontent.ai** | Content management | Client-side | React Query (5min) |
| **Google Places** | Ratings/reviews | Serverless function | 24-hour in-memory |
| **Google Maps** | Map visualization | Client-side | Dynamic loading |
| **K2 PMS** | Availability (mock) | Serverless function | None (mock) |

## Environment Variables

```bash
# Required
VITE_ALGOLIA_APP_ID=...
VITE_ALGOLIA_SEARCH_KEY=...
GOOGLE_PLACES_API_KEY=...              # Server-side
VITE_GOOGLE_PLACES_API_KEY=...         # Client-side (same value)

# Optional (for preview mode)
VITE_ENVIRONMENT_ID=...
VITE_DELIVERY_API_KEY=...
```

## API Endpoints

**GET `/api/google-ratings?placeId=...`**
- Returns: `{ rating, user_ratings_total, reviews[] }`
- Cache: 24 hours

**GET `/api/availability?campgroundId=...&checkIn=...&checkOut=...`**
- Returns: `{ available, siteTypes[], checkIn, checkOut }`
- Status: Mock data

## File Structure

```
src/
├── components/
│   ├── search/          # Search UI components
│   └── campgrounds/     # Detail page components
├── pages/
│   ├── SearchPage.tsx   # Search + Map toggle
│   └── CampgroundDetailPage.tsx
├── config/
│   └── algolia.ts       # Algolia client config
├── hooks/
│   └── useGoogleMaps.ts # Maps loading hook
└── types/
    └── algolia.ts        # Algolia TypeScript types

api/
├── google-ratings/
│   └── index.ts          # Google Places API function
└── availability/
    └── index.ts          # Mock PMS function
```

## Common Commands

```bash
# Development
npm run dev              # Frontend only (no serverless functions)
vercel dev               # Full-stack (includes serverless functions)

# Build
npm run build            # TypeScript + Vite build

# Model Generation
npm run model:generate   # Regenerate Kontent.ai TypeScript models
```

## Troubleshooting Quick Fixes

**Search not working:**
- Check `VITE_ALGOLIA_APP_ID` and `VITE_ALGOLIA_SEARCH_KEY`

**Ratings not showing:**
- Check `GOOGLE_PLACES_API_KEY` in Vercel
- Verify campground has `google_place_id` in Kontent.ai
- Test: `/api/google-ratings?placeId=YOUR_PLACE_ID`

**Map not loading:**
- Check `VITE_GOOGLE_PLACES_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY`
- Verify Maps JavaScript API enabled in Google Cloud

**Build errors:**
- Run `npm run build` locally
- Check TypeScript errors
- Verify all imports correct

## Cost Estimates

- **Vercel:** Free tier (typical usage)
- **Algolia:** Depends on plan (free tier available)
- **Google Places:** ~$3/month (with 24h cache)
- **Google Maps:** Free (first 28K loads/month)
- **Kontent.ai:** Depends on plan

## Next Steps for Partner

1. **Review:** Read `TECHNICAL_OVERVIEW.md` for full details
2. **Setup:** Configure environment variables
3. **Test:** Verify all features work
4. **Swap APIs:** Replace mock K2 PMS when ready
5. **Customize:** Add branding, adjust styling as needed
