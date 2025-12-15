# Google Maps Setup Guide

## Overview

The Map View feature requires a Google Maps JavaScript API key. This key is used **client-side** to load the Google Maps library.

## Environment Variable

**Options:**
- `VITE_GOOGLE_PLACES_API_KEY` (recommended - consistent with server-side naming)
- `VITE_GOOGLE_MAPS_API_KEY` (alternative - also works)

**Important:** These variables use the `VITE_` prefix because they're needed client-side in the browser.

**Note:** You can use the **same API key value** for both Google Maps and Google Places API. If you already have `GOOGLE_PLACES_API_KEY` set up, you can reuse that same key value for the client-side variable. The code will automatically use `VITE_GOOGLE_MAPS_API_KEY` if set, otherwise fall back to `VITE_GOOGLE_PLACES_API_KEY`. Just make sure to enable both APIs (Maps JavaScript API and Places API) in Google Cloud Console for that key.

## Setup Instructions

### 1. Get Your Google Maps JavaScript API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API** (not Places API - that's separate)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps JavaScript API" only
   - Under "Application restrictions", restrict by HTTP referrer:
     - Add your domain: `localhost:3000/*` (for local dev)
     - Add your Vercel domain: `*.vercel.app/*` (for production)
     - Add your custom domain if applicable

### 2. Local Development Setup

1. Create or update `.env.local` file in the project root:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

**Note:** The Google Maps script loads dynamically when you switch to Map View, so it won't affect initial page load performance.

### 3. Vercel Production Setup

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `personalization-ab-demo`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add (use the same API key value as `GOOGLE_PLACES_API_KEY`):
   - **Name:** `VITE_GOOGLE_PLACES_API_KEY` (recommended) OR `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** Your Google Maps JavaScript API key (same as Places API key)
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**
7. Redeploy your application

### 4. Verify Setup

#### Local Testing:
1. Start dev server: `npm run dev`
2. Navigate to `/search`
3. Click "Map View" toggle button
4. Map should load with markers for campgrounds

#### Production Testing:
1. Deploy to Vercel
2. Visit `/search` on your deployed site
3. Click "Map View" toggle
4. Verify map loads with markers

## Features

- **Dynamic Loading**: Google Maps script only loads when Map View is selected
- **Markers**: Each campground gets a marker based on lat/long from Algolia
- **Info Windows**: Click a marker to see campground name, location, and link to detail page
- **Auto-fit Bounds**: Map automatically adjusts to show all visible campgrounds
- **Responsive**: Map is full-width and 600px tall

## Troubleshooting

### "Google Maps API key not found"

**Local Development:**
- Check that `.env.local` exists and contains either `VITE_GOOGLE_PLACES_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY`
- Use the same API key value as `GOOGLE_PLACES_API_KEY`
- Restart dev server after adding the variable
- Make sure the variable name starts with `VITE_`

**Production:**
- Verify either `VITE_GOOGLE_PLACES_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY` is set in Vercel dashboard
- Use the same API key value as `GOOGLE_PLACES_API_KEY`
- Check that it's set for the correct environment
- Redeploy after adding the variable

### "Failed to load Google Maps JavaScript API"

- Check that Maps JavaScript API is enabled in Google Cloud Console
- Verify API key restrictions allow your domain
- Check browser console for specific error messages
- Ensure billing is enabled for your Google Cloud project

### Map Shows But No Markers

- Check that campgrounds in Algolia have valid `latitude` and `longitude` values
- Verify coordinates are numbers, not strings
- Check browser console for errors

### Map Doesn't Update When Filters Change

- This is expected - the map updates when you change search/filters
- Markers are recreated based on current Algolia search results
- If markers don't update, check that Algolia search is working correctly

## Cost Estimate

- Google Maps JavaScript API: **Free** for most usage
- First 28,000 map loads per month are free
- After that: $7 per 1,000 additional loads
- Typical usage: Very low cost (maps only load when Map View is selected)

## Related Files

- Hook: `src/hooks/useGoogleMaps.ts` - Loads Google Maps script dynamically
- Component: `src/components/search/MapView.tsx` - Renders map with markers
- Integration: `src/pages/SearchPage.tsx` - Toggle between List/Map views

## Security Notes

✅ **Good:** API key is restricted to specific domains  
✅ **Good:** Maps script loads dynamically (not on every page)  
⚠️ **Note:** API key is visible in client-side code (this is normal for Maps JavaScript API)  
✅ **Recommended:** Restrict API key to Maps JavaScript API only in Google Cloud Console

**Why is the key exposed?**
- Google Maps JavaScript API is a client-side library that runs in the browser
- The API key is embedded in the script URL that loads Maps
- This is by design - Google expects keys to be visible in the browser

**How to secure it:**
- ✅ Use HTTP referrer restrictions (only your domain)
- ✅ Restrict to Maps JavaScript API only
- ✅ Monitor usage and set billing alerts

**For detailed security guidance, see:** [Google API Key Security Guide](./GOOGLE_API_KEY_SECURITY.md)

