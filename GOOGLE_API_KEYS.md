# Google API Keys Guide

## Overview

This application uses two Google APIs:
1. **Google Places API** - Server-side (for ratings/reviews)
2. **Google Maps JavaScript API** - Client-side (for map view)

## Can I Use the Same API Key?

**Yes!** You can use the **same API key** for both APIs. In fact, it's recommended to use one API key for multiple Google APIs.

## Recommended Setup: Single API Key

### Option 1: Use One API Key for Both (Recommended)

1. **Create one API key** in Google Cloud Console
2. **Enable both APIs** for that key:
   - Places API
   - Maps JavaScript API
3. **Set environment variables**:
   ```bash
   # Server-side (no VITE_ prefix)
   GOOGLE_PLACES_API_KEY=your_single_api_key_here
   
   # Client-side (VITE_ prefix required)
   VITE_GOOGLE_MAPS_API_KEY=your_single_api_key_here
   ```
4. **Restrict the API key**:
   - API restrictions: Enable both "Places API" and "Maps JavaScript API"
   - Application restrictions: 
     - For Places API: Restrict by IP (serverless functions) or HTTP referrer
     - For Maps JavaScript API: Restrict by HTTP referrer (your domains)

### Option 2: Use Separate API Keys

If you prefer separate keys (e.g., for different restrictions or billing):

```bash
# Server-side Places API
GOOGLE_PLACES_API_KEY=places_api_key_here

# Client-side Maps API
VITE_GOOGLE_MAPS_API_KEY=maps_api_key_here
```

## Why Two Environment Variables?

Even if you use the same API key value, you need two environment variables because:

1. **`GOOGLE_PLACES_API_KEY`** (no prefix)
   - Used in serverless functions (`/api/google-ratings`)
   - Not exposed to client-side code
   - Vercel serverless functions can access it

2. **`VITE_GOOGLE_MAPS_API_KEY`** (with `VITE_` prefix)
   - Used in client-side React components (`MapView`)
   - Exposed to browser (this is normal for Maps JavaScript API)
   - Vite only exposes env vars with `VITE_` prefix to client code

## Setup Steps

### 1. Create API Key in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable both APIs:
   - **Places API** (for ratings)
   - **Maps JavaScript API** (for map view)
4. Create API Key: **Credentials** → **Create Credentials** → **API Key**

### 2. Configure API Key Restrictions

**API Restrictions:**
- Select "Restrict key"
- Choose both:
  - ✅ Places API
  - ✅ Maps JavaScript API

**Application Restrictions:**

For **Places API** (server-side):
- Option A: Restrict by IP (if using fixed IPs)
- Option B: Restrict by HTTP referrer: `*.vercel.app/*` (for Vercel)
- Option C: None (if using other restrictions)

For **Maps JavaScript API** (client-side):
- Restrict by HTTP referrer:
  - `localhost:3000/*` (local dev)
  - `*.vercel.app/*` (Vercel production)
  - Your custom domain if applicable

### 3. Set Environment Variables

**Local Development (`.env.local`):**
```bash
# Server-side (required)
GOOGLE_PLACES_API_KEY=your_api_key_here

# Client-side (choose one - both work, use same key value)
# Option A: Use VITE_GOOGLE_PLACES_API_KEY (recommended - consistent naming)
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here

# Option B: Or use VITE_GOOGLE_MAPS_API_KEY (also works)
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Vercel Production:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add environment variables with the same API key value:
   - `GOOGLE_PLACES_API_KEY` = `your_api_key_here` (required for server-side)
   - `VITE_GOOGLE_PLACES_API_KEY` = `your_api_key_here` (recommended for client-side)
   - OR `VITE_GOOGLE_MAPS_API_KEY` = `your_api_key_here` (alternative for client-side)
3. Select all environments (Production, Preview, Development)
   
**Note:** You only need to set ONE client-side variable (`VITE_GOOGLE_PLACES_API_KEY` OR `VITE_GOOGLE_MAPS_API_KEY`), not both. The code will automatically use whichever is set.

## Cost Considerations

- **Places API**: ~$3/month for typical usage (24h cache reduces calls)
- **Maps JavaScript API**: Free for first 28,000 loads/month, then $7 per 1,000
- **Using same key**: No additional cost - you're just enabling multiple APIs on one key

## Security Best Practices

✅ **Use one API key** for both APIs (simpler management)  
✅ **Enable both APIs** in API restrictions  
✅ **Restrict by HTTP referrer** for Maps JavaScript API  
✅ **Restrict by IP/referrer** for Places API (server-side)  
✅ **Monitor usage** in Google Cloud Console  
⚠️ **Note**: Maps JavaScript API key is visible in client code (this is normal and expected)

### Why is the Maps API Key Exposed?

**The Maps JavaScript API key MUST be client-side** because:
- Google Maps is a client-side JavaScript library
- The API key is embedded in the script URL: `https://maps.googleapis.com/maps/api/js?key=YOUR_KEY`
- This is how Google designed it - they expect keys to be visible in the browser

**Security comes from restrictions, not hiding the key:**
- ✅ HTTP referrer restrictions (only your domain can use it)
- ✅ API restrictions (only Maps JavaScript API enabled)
- ✅ Monitor usage and set billing alerts

**For more details, see:** [Google API Key Security Guide](./GOOGLE_API_KEY_SECURITY.md)

## Troubleshooting

### "API key not valid" errors

- Check that both APIs are enabled in Google Cloud Console
- Verify API restrictions include both "Places API" and "Maps JavaScript API"
- Ensure billing is enabled for your Google Cloud project

### Maps work but Places API doesn't (or vice versa)

- Check that the API key has both APIs enabled
- Verify environment variables are set correctly
- Check API restrictions allow both APIs

### Different keys for different purposes

If you want separate keys (e.g., different billing accounts):
- Create two separate API keys
- Enable Places API on one, Maps JavaScript API on the other
- Set different values for `GOOGLE_PLACES_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY`

## Related Documentation

- [Google Places Setup](./GOOGLE_PLACES_SETUP.md) - Detailed Places API setup
- [Google Maps Setup](./GOOGLE_MAPS_SETUP.md) - Detailed Maps API setup

