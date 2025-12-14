# Map View Debug Checklist

## What to Check When Map Doesn't Appear

### 1. Check Browser Console

Open DevTools (F12) → Console tab, then click "Map View". Look for these logs:

**Expected sequence:**
```
[useGoogleMaps] Hook initialized
[useGoogleMaps] API key check: { hasApiKey: true, ... }
[useGoogleMaps] Creating script tag: ...
[useGoogleMaps] Appending script to document.head
[useGoogleMaps] Script loaded successfully
[useGoogleMaps] google.maps is available
[MapView] Component mounted/updated: { hitsCount: X, isLoaded: true, ... }
[MapView] useEffect triggered: { isLoaded: true, hasMapRef: true, ... }
[MapView] Initializing map with hits: X
[MapView] Valid hits with coordinates: X
[MapView] Creating new map instance
[MapView] Map instance created successfully
[MapView] Creating markers for X campgrounds
[MapView] Map initialization complete
```

### 2. Check Visual Debug Panel

When Map View is active, you should see a small black debug panel in the top-right corner showing:
- Hits: X
- Valid coords: X
- Maps loaded: Yes/No
- Has ref: Yes/No

**If debug panel shows:**
- `Maps loaded: No` → API key issue or script not loading
- `Valid coords: 0` → No campgrounds have coordinates
- `Has ref: No` → Map container not rendering

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Click "Map View"
3. Filter by "maps.googleapis.com"
4. Look for request to `/maps/api/js?key=...`

**What to check:**
- Status: Should be 200 (OK)
- If 403: API key invalid or restricted
- If 404: Wrong URL or API disabled
- Response: Should be JavaScript code (not HTML error page)

### 4. Check Environment Variables

**In browser console, run:**
```javascript
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
console.log('VITE_GOOGLE_PLACES_API_KEY:', import.meta.env.VITE_GOOGLE_PLACES_API_KEY);
```

**Expected:** One of them should show your API key (not `undefined`)

### 5. Check Map Container Element

**In browser console, run:**
```javascript
// After clicking Map View
const mapDiv = document.querySelector('[ref]') || document.querySelector('div[style*="minHeight: 600px"]');
console.log('Map container:', mapDiv);
console.log('Width:', mapDiv?.offsetWidth);
console.log('Height:', mapDiv?.offsetHeight);
console.log('Visible:', mapDiv?.offsetParent !== null);
```

**Expected:**
- Width: > 0 (not 0)
- Height: 600 (or close)
- Visible: true

### 6. Check Google Maps Object

**In browser console, run:**
```javascript
console.log('window.google:', window.google);
console.log('window.google.maps:', window.google?.maps);
console.log('Map constructor:', window.google?.maps?.Map);
```

**Expected:**
- `window.google` should exist
- `window.google.maps` should exist
- `window.google.maps.Map` should be a function

### 7. Check Algolia Hits Data

**Temporary: Add this to SearchResults.tsx to log hits:**
```typescript
console.log('[SearchResults] Hits:', hits);
console.log('[SearchResults] Sample hit:', hits[0]);
```

**Check:**
- Do hits have `latitude` and `longitude`?
- Are they numbers (not strings)?
- Are they valid coordinates (not 0,0 or null)?

### 8. Common Issues & Quick Fixes

#### Issue: "API key not found" in console
**Fix:** Add `VITE_GOOGLE_PLACES_API_KEY` to `.env.local` and restart dev server

#### Issue: Script loads but `google.maps` undefined
**Fix:** Check Google Cloud Console - Maps JavaScript API must be enabled

#### Issue: Map container has zero width/height
**Fix:** Check CSS - parent container might be constraining it

#### Issue: "No valid coordinates" error
**Fix:** Check Algolia index - campgrounds need `latitude` and `longitude` as numbers

#### Issue: Map shows but no markers
**Fix:** Check console logs - should show "Creating markers for X campgrounds"

#### Issue: Loading spinner forever
**Fix:** Check Network tab - script might be failing to load (403/404)

### 9. Test API Key Directly

**In browser, open new tab and paste:**
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places
```

**Expected:** Should load JavaScript code
**If error:** API key invalid or Maps JavaScript API not enabled

### 10. Check for CSS Issues

**In browser DevTools:**
1. Find the map container `<div ref={mapRef}>`
2. Check Computed styles:
   - `display`: Should not be `none`
   - `width`: Should be > 0
   - `height`: Should be 600px
   - `z-index`: Should not be negative
   - `overflow`: Should not be `hidden` (might hide map)

## Still Not Working?

Share these details:
1. **Console logs** (all `[useGoogleMaps]` and `[MapView]` messages)
2. **Network tab screenshot** (Maps API request)
3. **Debug panel values** (from top-right corner)
4. **What you see** (blank, loading, error message, etc.)
5. **Environment** (local dev with `npm run dev` or production?)
