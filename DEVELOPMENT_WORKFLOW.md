# Development Workflow Options

## Is `vercel dev` Strictly Necessary?

**Short answer: No, not for day-to-day frontend development.**

### Option 1: Frontend-Only Development (Recommended for Most Work)

**Use `npm run dev` for frontend development:**

```bash
npm run dev
```

**Pros:**
- ✅ Faster startup
- ✅ No Vercel CLI needed
- ✅ Simpler workflow
- ✅ Works for all frontend features (search, detail pages, etc.)

**Cons:**
- ❌ Google Ratings API won't work locally (serverless function)
- ❌ Availability API won't work locally (serverless function)
- ❌ Need to deploy to Vercel to test these features

**When to use:**
- Developing UI components
- Working on search functionality
- Building detail pages
- Testing Algolia integration
- Most frontend work

### Option 2: Full-Stack Development (For Testing Serverless Functions)

**Use `vercel dev` when you need to test serverless functions:**

```bash
vercel dev
```

**Pros:**
- ✅ Tests Google Ratings API locally
- ✅ Tests Availability API locally
- ✅ Full-stack development

**Cons:**
- ⚠️ Requires Vercel CLI setup
- ⚠️ Can have configuration issues (like the HTML parsing error)
- ⚠️ Slower startup

**When to use:**
- Testing Google Ratings integration
- Testing Availability checker
- Debugging serverless function issues
- Final testing before deployment

## Does Google API Need to Be Serverless?

**Yes, for security reasons:**

### Why Serverless Functions?

1. **API Key Security**: Google Places API key must be kept secret
   - ❌ Client-side: API key exposed in browser (security risk)
   - ✅ Serverless: API key stays on server (secure)

2. **Cost Control**: Server-side caching reduces API calls
   - Current implementation has 24-hour cache
   - Reduces Google API costs

3. **Best Practice**: Serverless functions are the standard approach for API integrations

### Alternative: Client-Side Google Places API (Not Recommended)

You *could* use Google Places JavaScript API client-side, but:
- ⚠️ Still requires API key (though domain-restricted)
- ⚠️ Less secure (key visible in network requests)
- ⚠️ No server-side caching
- ⚠️ Higher API costs

**Recommendation: Keep serverless functions**

## Recommended Development Workflow

### Daily Development (90% of the time):

```bash
# 1. Start frontend dev server
npm run dev

# 2. Develop frontend features
# - Search page
# - Detail pages
# - UI components
# - Algolia integration

# 3. Test in browser
# - All frontend features work
# - Google Ratings won't show (expected)
# - Availability won't work (expected)
```

### Testing Serverless Functions (10% of the time):

```bash
# Option A: Test in production (easiest)
# 1. Push to Vercel
git push

# 2. Test on deployed site
# - Google Ratings will work
# - Availability will work

# Option B: Test locally (if needed)
# 1. Set up .env.local with GOOGLE_PLACES_API_KEY
# 2. Run vercel dev
vercel dev

# 3. Test serverless functions locally
```

## Simplifying Your Workflow

### If You Want to Skip `vercel dev` Entirely:

1. **Develop frontend with `npm run dev`**
   - All frontend features work
   - Google Ratings component won't show (gracefully hidden)
   - Availability checker won't work (shows mock data or disabled)

2. **Test serverless functions in production**
   - Deploy to Vercel
   - Test Google Ratings on deployed site
   - Test Availability on deployed site

3. **Add a development mode indicator** (optional):
   ```tsx
   // In GoogleRatings.tsx
   if (import.meta.env.DEV && !window.location.hostname.includes('vercel.app')) {
     return <div>Google Ratings (serverless function - test in production)</div>;
   }
   ```

## Summary

- ✅ **`vercel dev` is NOT necessary** for most development work
- ✅ **Google API SHOULD remain serverless** for security
- ✅ **Use `npm run dev`** for frontend development
- ✅ **Test serverless functions in production** (or use `vercel dev` only when needed)

The HTML parsing error with `vercel dev` is annoying but doesn't block your development - you can work around it by using `npm run dev` for most tasks!
