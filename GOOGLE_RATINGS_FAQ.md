# Google Ratings FAQ

## Question 1: Do I need to push to Vercel to test serverless functions?

**Answer: No, you can test locally using `vercel dev`**

### Local Testing (Recommended)

You can test serverless functions locally without pushing to Vercel:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Add API key to `.env.local`**:
   ```bash
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. **Run local development with Vercel CLI**:
   ```bash
   vercel dev
   ```
   
   This command:
   - ✅ Runs your Vite dev server (frontend)
   - ✅ Runs serverless functions locally (`/api/google-ratings`, `/api/availability`)
   - ✅ Loads environment variables from `.env.local`
   - ✅ Makes functions available at `http://localhost:3000/api/google-ratings`

4. **Test the API directly**:
   ```bash
   curl "http://localhost:3000/api/google-ratings?placeId=YOUR_PLACE_ID"
   ```

### What Happens:

- **`npm run dev`** (Vite only): ❌ Serverless functions won't work
- **`vercel dev`** (Vercel CLI): ✅ Serverless functions work locally

### When You Need to Push to Vercel:

- Only for **production testing** on the actual Vercel domain
- For **sharing with others** or **demo purposes**
- For **testing production environment variables**

**Bottom Line:** Use `vercel dev` for local testing - no need to push to Vercel!

---

## Question 2: Do Google reviews use the `google_place_id` from the CMS?

**Answer: Yes, exactly!**

### Data Flow:

1. **CMS (Kontent.ai):**
   - Campground item has `google_place_id` element
   - Value: e.g., `"ChIJN1t_tDeuEmsRUsoyG83frY4"` (Google Place ID)

2. **Detail Page (`CampgroundDetailPage.tsx`):**
   ```typescript
   {campground.elements.google_place_id?.value && (
     <GoogleRatings placeId={campground.elements.google_place_id.value} />
   )}
   ```
   - Checks if `google_place_id` exists
   - Passes the Place ID to the `GoogleRatings` component

3. **Component (`GoogleRatings.tsx`):**
   ```typescript
   const url = `/api/google-ratings?placeId=${encodeURIComponent(placeId)}`;
   ```
   - Fetches from `/api/google-ratings` with the Place ID

4. **API Route (`api/google-ratings/index.ts`):**
   ```typescript
   const { placeId } = request.query;
   // Uses placeId to fetch from Google Places API
   ```
   - Receives Place ID from query parameter
   - Calls Google Places API with that Place ID
   - Returns ratings and reviews

### Example:

**In Kontent.ai:**
```
Campground: "Sedona Cottonwood"
google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4"
```

**What happens:**
1. Detail page loads campground from Kontent.ai
2. Reads `google_place_id` value: `"ChIJN1t_tDeuEmsRUsoyG83frY4"`
3. Component calls: `/api/google-ratings?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4`
4. API route fetches from Google Places API using that Place ID
5. Returns ratings/reviews for that specific place
6. Component displays stars and review count

### Important Notes:

- ✅ **Source of truth:** `google_place_id` comes from Kontent.ai CMS
- ✅ **No hardcoding:** Each campground can have its own Place ID
- ✅ **Content editors control:** They add/update Place IDs in Kontent.ai
- ✅ **Component only renders if Place ID exists:** If missing, section doesn't show

---

## Summary

1. **Local Testing:** Use `vercel dev` - no need to push to Vercel for testing
2. **Data Source:** Google reviews use `campground.elements.google_place_id.value` from Kontent.ai CMS

