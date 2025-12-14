# Google Places API Setup Guide

## Overview

The Google Ratings feature requires a Google Places API key. This key is used **server-side only** in the `/api/google-ratings` route and is never exposed to the client.

## Environment Variable: `GOOGLE_PLACES_API_KEY`

**Important:** This variable does NOT have the `VITE_` prefix because it's server-side only.

**Note:** You can use the **same API key value** for both Google Places API and Google Maps JavaScript API. If you're also using Map View, set `VITE_GOOGLE_PLACES_API_KEY` (or `VITE_GOOGLE_MAPS_API_KEY`) to the same value. Just make sure to enable both APIs (Places API and Maps JavaScript API) in Google Cloud Console for that key.

## Setup Instructions

### 1. Get Your Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** (specifically "Places API" - not "Places API (New)")
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" only
   - Under "Application restrictions", restrict by HTTP referrer (for web) or IP (for serverless)

### 2. Local Development Setup

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't:
   ```bash
   npm i -g vercel
   ```

2. Create a `.env.local` file in the project root:
   ```bash
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. Run the development server with Vercel CLI:
   ```bash
   vercel dev
   ```
   
   This will:
   - Load environment variables from `.env.local`
   - Run your Vite dev server
   - Run serverless functions locally with the environment variables

#### Option B: Using Standard `.env` File

1. Add to your `.env` file (or create it if it doesn't exist):
   ```bash
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

2. When running `npm run dev`, the serverless functions won't automatically have access to this variable unless you use `vercel dev`.

**Note:** For local testing of serverless functions, `vercel dev` is recommended as it properly loads environment variables.

### 3. Vercel Production Setup

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `personalization-ab-demo`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name:** `GOOGLE_PLACES_API_KEY`
   - **Value:** Your Google Places API key
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

### 4. Verify Setup

#### Local Testing:
1. Start dev server: `vercel dev` (or `npm run dev` if not using serverless functions)
2. Navigate to a campground detail page with a `google_place_id`
3. Check browser console for any errors
4. The Google Ratings component should appear if the Place ID is valid

#### Production Testing:
1. Deploy to Vercel (or redeploy after adding env var)
2. Visit a campground detail page
3. Verify Google Ratings component displays

## Troubleshooting

### "GOOGLE_PLACES_API_KEY environment variable is not set"

**Local Development:**
- Make sure you're using `vercel dev` (not just `npm run dev`)
- Check that `.env.local` exists and contains `GOOGLE_PLACES_API_KEY`
- Restart `vercel dev` after adding the variable

**Production:**
- Verify the variable is set in Vercel dashboard
- Check that it's set for the correct environment (Production/Preview)
- Redeploy after adding the variable

### "Google Places API error status: REQUEST_DENIED"

- Check that Places API is enabled in Google Cloud Console
- Verify API key restrictions allow Places API
- Check that billing is enabled for your Google Cloud project

### Ratings Not Showing

- Verify the campground has a `google_place_id` value in Kontent.ai
- Check browser console for errors
- Verify the Place ID is valid (you can test it in Google Places API explorer)
- Check that the API key has proper permissions

## Security Notes

✅ **Good:** `GOOGLE_PLACES_API_KEY` is server-side only (no `VITE_` prefix)  
✅ **Good:** API key is never exposed to client-side code  
✅ **Good:** API route implements 24-hour caching to minimize API calls  
⚠️ **Recommended:** Restrict API key in Google Cloud Console to specific APIs and domains

## Cost Estimate

- Google Places API: ~$3/month for typical usage
- 24-hour cache significantly reduces API calls
- First 1,000 requests per month are free (as of 2024)

## Related Files

- API Route: `api/google-ratings/route.ts`
- Component: `src/components/campgrounds/GoogleRatings.tsx`
- Integration: `src/pages/CampgroundDetailPage.tsx`
