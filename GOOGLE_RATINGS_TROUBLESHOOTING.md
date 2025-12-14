# Google Ratings Troubleshooting Guide

## Issue: Google Reviews Not Showing

If Google reviews aren't appearing on campground detail pages, follow these debugging steps:

## Step 1: Check Browser Console

1. Open the campground detail page in your browser
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Look for messages starting with `[GoogleRatings]` or `[Google Ratings API]`

### What to Look For:

- ✅ **Good:** `[GoogleRatings] Fetching from: /api/google-ratings?placeId=...`
- ✅ **Good:** `[GoogleRatings] Response status: 200`
- ✅ **Good:** `[GoogleRatings] Data received: { rating: 4.5, user_ratings_total: 123 }`
- ❌ **Bad:** `[GoogleRatings] No placeId provided` - Campground missing `google_place_id`
- ❌ **Bad:** `[GoogleRatings] Error: Failed to fetch ratings: 500` - API route error
- ❌ **Bad:** `[GoogleRatings] No reviews found (user_ratings_total is 0)` - Place has no reviews

## Step 2: Check Network Tab

1. Open Developer Tools → **Network** tab
2. Filter by "google-ratings"
3. Click on the request to `/api/google-ratings?placeId=...`
4. Check:
   - **Status Code:** Should be `200`
   - **Response:** Should contain `rating` and `user_ratings_total`

### Common Status Codes:

- **200:** Success (check response body)
- **400:** Missing or invalid `placeId` parameter
- **405:** Wrong HTTP method (should be GET)
- **500:** Server error (check Vercel function logs)

## Step 3: Verify Campground Has Place ID

1. Check that the campground in Kontent.ai has a `google_place_id` value
2. The component only renders if `campground.elements.google_place_id?.value` exists
3. If missing, add the Place ID in Kontent.ai

## Step 4: Test API Route Directly

### Local Testing:
```bash
# Start dev server with Vercel CLI
vercel dev

# In another terminal, test the API:
curl "http://localhost:3000/api/google-ratings?placeId=YOUR_PLACE_ID"
```

### Production Testing:
```bash
# Replace YOUR_DOMAIN with your Vercel domain
curl "https://YOUR_DOMAIN.vercel.app/api/google-ratings?placeId=YOUR_PLACE_ID"
```

### Expected Response:
```json
{
  "rating": 4.5,
  "user_ratings_total": 123,
  "reviews": [...]
}
```

### Error Responses:
```json
{
  "error": "Missing or invalid placeId parameter"
}
```

## Step 5: Check Vercel Function Logs

### For Production:
1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on `/api/google-ratings`
3. Check **Logs** tab for errors

### For Local Development:
Check your terminal where `vercel dev` is running for console logs.

### What to Look For:

- ✅ **Good:** `[Google Ratings API] Request received`
- ✅ **Good:** `[Google Ratings API] Checking API key... hasApiKey: true`
- ✅ **Good:** `[Google Ratings API] Google API response status: OK`
- ❌ **Bad:** `GOOGLE_PLACES_API_KEY environment variable is not set`
- ❌ **Bad:** `Google Places API error status: REQUEST_DENIED`
- ❌ **Bad:** `Google Places API error status: INVALID_REQUEST`

## Step 6: Verify Environment Variable

### Local:
1. Check `.env` or `.env.local` file contains:
   ```bash
   GOOGLE_PLACES_API_KEY=your_key_here
   ```
2. Restart `vercel dev` after adding/changing the variable

### Production:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `GOOGLE_PLACES_API_KEY` is set
3. Check it's set for the correct environment (Production/Preview)
4. **Redeploy** after adding/changing variables

## Step 7: Verify Google Places API Key

### Check API Key is Valid:
1. Test directly with Google Places API:
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=YOUR_PLACE_ID&fields=rating,user_ratings_total,reviews&key=YOUR_API_KEY"
   ```

### Common API Errors:

- **REQUEST_DENIED:**
  - Places API not enabled in Google Cloud Console
  - API key restrictions blocking the request
  - Billing not enabled

- **INVALID_REQUEST:**
  - Invalid Place ID format
  - Missing required parameters

- **OVER_QUERY_LIMIT:**
  - API quota exceeded
  - Check billing and quotas in Google Cloud Console

## Step 8: Check Component Logic

The component hides itself if:
- No `placeId` provided
- Still loading (`isLoading === true`)
- Error occurred (`error` exists)
- No data (`!data`)
- No reviews (`user_ratings_total === 0`)

To debug, temporarily modify `GoogleRatings.tsx` to show error states:
```typescript
// Temporarily add for debugging:
if (error) {
  return <div>Error: {error.message}</div>;
}
if (isLoading) {
  return <div>Loading...</div>;
}
```

## Quick Checklist

- [ ] Campground has `google_place_id` value in Kontent.ai
- [ ] `GOOGLE_PLACES_API_KEY` is set in `.env` (local) or Vercel (production)
- [ ] Using `vercel dev` for local testing (not just `npm run dev`)
- [ ] Places API is enabled in Google Cloud Console
- [ ] API key has proper permissions/restrictions
- [ ] Billing is enabled for Google Cloud project
- [ ] Place ID is valid (test in Google Places API explorer)
- [ ] Check browser console for errors
- [ ] Check Vercel function logs for errors
- [ ] Test API route directly with curl

## Still Not Working?

1. **Check the exact error message** in browser console or Vercel logs
2. **Test the Place ID** directly with Google Places API
3. **Verify the API key** works with a simple curl request
4. **Check component render logic** - it might be hiding due to conditions

## File Structure Fix

**Important:** The API routes were renamed from `route.ts` to `index.ts` because:
- Vercel serverless functions use `index.ts` (not `route.ts`)
- `route.ts` is for Next.js App Router, not standalone Vercel functions

Make sure your files are:
- `api/google-ratings/index.ts` ✅
- `api/availability/index.ts` ✅

Not:
- `api/google-ratings/route.ts` ❌
- `api/availability/route.ts` ❌
