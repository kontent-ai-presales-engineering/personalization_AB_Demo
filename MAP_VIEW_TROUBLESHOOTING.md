# Map View Troubleshooting Guide

## Debugging Steps

I've added extensive console logging to help diagnose the issue. When you click "Map View", check your browser console for messages prefixed with `[useGoogleMaps]` and `[MapView]`.

### Step 1: Check Console Logs

Open browser DevTools (F12) → Console tab, then click "Map View" toggle. Look for:

**Expected logs:**
```
[useGoogleMaps] Hook initialized
[useGoogleMaps] API key check: { hasVITE_GOOGLE_MAPS_API_KEY: true/false, ... }
[MapView] Component mounted/updated: { hitsCount: X, isLoaded: true/false, ... }
```

### Step 2: Common Issues & Solutions

#### Issue: "API key not found"
**Symptoms:** Console shows `hasApiKey: false`
**Solution:**
- Check `.env.local` has `VITE_GOOGLE_PLACES_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY`
- Restart dev server after adding env var
- In production: Check Vercel environment variables

#### Issue: "Maps not loaded yet"
**Symptoms:** Console shows `isLoaded: false`, no error
**Solution:**
- Check Network tab for Google Maps script request
- Look for script tag in `<head>`: `<script src="https://maps.googleapis.com/maps/api/js?key=...">`
- Check if script request fails (404, 403, etc.)

#### Issue: "No valid coordinates"
**Symptoms:** Console shows `Valid hits with coordinates: 0`
**Solution:**
- Check Algolia index has `latitude` and `longitude` fields
- Verify coordinates are numbers, not strings
- Check a few hits in console: `console.log(hits)` to see data structure

#### Issue: Map container not visible
**Symptoms:** Map initializes but nothing shows
**Solution:**
- Check if map container has height: `h-[600px]` class applied
- Check browser DevTools → Elements → Find `<div ref={mapRef}>` → Verify it has height
- Check for CSS conflicts (z-index, overflow, etc.)

#### Issue: Script loads but google.maps undefined
**Symptoms:** Console shows script loaded but `google.maps is not available`
**Solution:**
- Check Google Cloud Console: Maps JavaScript API enabled?
- Check API key restrictions allow your domain
- Verify API key is correct (not expired/revoked)

### Step 3: Manual Checks

**Check Environment Variables:**
```javascript
// In browser console:
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
console.log('VITE_GOOGLE_PLACES_API_KEY:', import.meta.env.VITE_GOOGLE_PLACES_API_KEY);
```

**Check Google Maps Script:**
```javascript
// In browser console:
const script = document.querySelector('script[src*="maps.googleapis.com"]');
console.log('Maps script:', script?.src);
```

**Check Window Object:**
```javascript
// In browser console:
console.log('window.google:', window.google);
console.log('window.google.maps:', window.google?.maps);
```

**Check Hits Data:**
```javascript
// In browser console (when on search page):
// You'll need to access hits from React DevTools or add temporary console.log
```

### Step 4: Network Tab Investigation

1. Open DevTools → Network tab
2. Click "Map View"
3. Look for request to `maps.googleapis.com/maps/api/js`
4. Check:
   - Status code (should be 200)
   - Response (should be JavaScript code)
   - If 403: API key issue or restrictions
   - If 404: Wrong URL or API disabled

### Step 5: Visual Inspection

**What you should see:**
1. Click "Map View" → Loading spinner appears
2. After 1-3 seconds → Map appears with markers
3. Click marker → Info window opens

**What might be wrong:**
- Blank gray box → Map not initializing (check console)
- Loading spinner forever → Script not loading (check network)
- Error message → Check error text (API key, etc.)
- Map shows but no markers → No valid coordinates (check console logs)

## Quick Fixes

### Fix 1: Ensure API Key is Set
```bash
# .env.local
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Fix 2: Verify API Key Works
Test the API key directly:
```bash
curl "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
```
Should return JavaScript code, not an error.

### Fix 3: Check Coordinates in Algolia
Verify your Algolia index has valid coordinates:
- `latitude`: number (e.g., 34.8697)
- `longitude`: number (e.g., -111.7610)
- Not strings like `"34.8697"`

### Fix 4: Clear Cache & Restart
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

## Still Not Working?

If console logs show everything is correct but map still doesn't appear:

1. **Check CSS:** Map container might be hidden or have zero height
2. **Check z-index:** Another element might be covering the map
3. **Check browser compatibility:** Google Maps requires modern browser
4. **Check ad blockers:** Some ad blockers block Google Maps scripts
5. **Check CORS:** Shouldn't be an issue for Maps API, but check Network tab

## Reporting the Issue

If you need help, provide:
1. Console logs (copy all `[useGoogleMaps]` and `[MapView]` messages)
2. Network tab screenshot (showing Maps API request)
3. Browser console errors (if any)
4. What you see visually (blank, loading, error message, etc.)
5. Environment: Local dev (`npm run dev`) or production?
