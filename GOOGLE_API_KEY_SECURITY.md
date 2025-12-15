# Google API Key Security Guide

## Why the Maps API Key Must Be Client-Side

**Short answer:** The Google Maps JavaScript API is a client-side library that runs in the browser. The API key is embedded in the script URL that loads the Maps library, so it must be exposed to the frontend.

**This is by design** - Google Maps is meant to be used client-side, and Google expects API keys to be visible in the browser.

## Current Setup

We're using the same API key for two different purposes:

1. **Client-Side (`VITE_GOOGLE_PLACES_API_KEY`):**
   - Used to load Google Maps JavaScript API
   - Embedded in: `https://maps.googleapis.com/maps/api/js?key=YOUR_KEY`
   - **Must be exposed** - this is how Maps works

2. **Server-Side (`GOOGLE_PLACES_API_KEY`):**
   - Used in serverless function for Places API (ratings/reviews)
   - Accessed via `process.env.GOOGLE_PLACES_API_KEY`
   - **Should be kept secret** - only accessible server-side

## Security Best Practices

### ✅ Recommended: Use Separate Keys

**Best practice:** Create two separate API keys:

1. **Maps JavaScript API Key** (client-side)
   - Restrict to: Maps JavaScript API only
   - Add HTTP referrer restrictions (your domain only)
   - Use for: Map display

2. **Places API Key** (server-side)
   - Restrict to: Places API only
   - No HTTP referrer restrictions (server-side)
   - Use for: Ratings/reviews

### 🔒 How to Secure Your Client-Side Key

Even though the key is exposed, you can protect it:

#### 1. HTTP Referrer Restrictions

In Google Cloud Console → APIs & Services → Credentials:

1. Click your API key
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domains:
   ```
   https://yourdomain.com/*
   https://*.yourdomain.com/*
   http://localhost:*  (for development)
   ```

#### 2. API Restrictions

1. Under "API restrictions", select "Restrict key"
2. Select only:
   - ✅ Maps JavaScript API
   - ❌ Don't select Places API (use separate key for that)

#### 3. Monitor Usage

- Set up billing alerts in Google Cloud Console
- Monitor API usage regularly
- Set quotas if needed

### 🎯 Recommended Configuration

**Option A: Two Separate Keys (Most Secure)**

```bash
# .env.local
# Client-side: Maps JavaScript API only
VITE_GOOGLE_MAPS_API_KEY=your_maps_key_here

# Server-side: Places API only  
GOOGLE_PLACES_API_KEY=your_places_key_here
```

**Restrictions:**
- Maps key: HTTP referrer restrictions + Maps JavaScript API only
- Places key: No referrer restrictions + Places API only

**Option B: Single Key (Current Setup)**

```bash
# .env.local
# Same key for both (less secure but simpler)
VITE_GOOGLE_PLACES_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
```

**Restrictions:**
- Must allow HTTP referrers (for Maps)
- Must enable both Maps JavaScript API and Places API
- Less secure because Places API is accessible from browser

## Why This Matters

### Without Restrictions

If someone steals your API key:
- They can use it from any domain
- They can call any enabled API
- You'll be charged for their usage
- Could lead to unexpected bills

### With Restrictions

Even if someone steals your key:
- ✅ Can only use it from your domain (HTTP referrer restriction)
- ✅ Can only call Maps JavaScript API (API restriction)
- ✅ Places API calls still require server-side key (protected)

## Cost Implications

**Maps JavaScript API:**
- Free: First 28,000 map loads/month
- After: $7 per 1,000 loads

**Places API:**
- Place Details: $17 per 1,000 requests
- We cache for 24 hours to minimize calls

**With restrictions:** Even if key is exposed, unauthorized usage is limited.

## Implementation Options

### Current Implementation (Single Key)

✅ Pros:
- Simple setup
- One key to manage

❌ Cons:
- Less secure
- Places API accessible from browser (if key exposed)

### Recommended Implementation (Separate Keys)

✅ Pros:
- More secure
- Better separation of concerns
- Places API fully protected server-side

❌ Cons:
- Two keys to manage
- Slightly more complex setup

## Migration Path

If you want to switch to separate keys:

1. Create new API key in Google Cloud Console
2. Restrict it to Maps JavaScript API only
3. Add HTTP referrer restrictions
4. Update `.env.local`:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=new_maps_key
   # Keep GOOGLE_PLACES_API_KEY as-is (server-side)
   ```
5. Update code to use `VITE_GOOGLE_MAPS_API_KEY` (already supports fallback)

## Summary

- **Maps API key MUST be client-side** - this is how Google Maps works
- **Protect it with restrictions** - HTTP referrers + API restrictions
- **Use separate keys** - Maps (client) vs Places (server) for better security
- **Monitor usage** - Set up billing alerts

The key being exposed is expected and normal for Maps API. The security comes from restrictions, not hiding the key.

