# Debugging Vercel Environment Variables

## Issue
The application shows outdated content on Vercel even though environment variables appear to be set correctly.

## Root Cause
Vite embeds environment variables **at build time** into the JavaScript bundle. If the build was done with old environment variables, the bundle will contain those old values even if you update Vercel's environment variables later.

## Debugging Steps

### 1. Check Browser Console
After deploying, open your Vercel site and check the browser console. You should see debug logs like:

```
🔍 AppContext Environment Variables: {
  environmentId: "f189fcee-05bc-0069-1f34-a1d35d692446",
  hasApiKey: true,
  collection: "default",
  ...
}
```

**If you see the OLD environment ID** (`8381787f-717e-007f-809d-a80af690508b`), the build was done with old env vars.

### 2. Verify Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set for **Production**:
   - `VITE_ENVIRONMENT_ID` = `f189fcee-05bc-0069-1f34-a1d35d692446`
   - `VITE_DELIVERY_API_KEY` = Your camping environment API key
   - `VITE_COLLECTION` = `default`

### 3. Check Build Logs
In Vercel, go to Deployments → Latest deployment → Build Logs

Look for lines showing environment variables being used. The build should show:
```
VITE_ENVIRONMENT_ID=f189fcee-05bc-0069-1f34-a1d35d692446
```

### 4. Force Fresh Build
1. Go to Deployments → Latest deployment
2. Click "..." → "Redeploy"
3. **IMPORTANT**: Uncheck "Use existing Build Cache"
4. Click "Redeploy"

This ensures Vercel rebuilds with the current environment variables.

### 5. Verify After Redeploy
After redeploying:
1. Hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Check console logs - should show camping environment ID
3. Verify landing page shows camping content

## Common Issues

### Issue: Environment variables not available at build time
**Solution**: Ensure variables are set for the correct environment (Production, Preview, Development)

### Issue: Build cache using old values
**Solution**: Redeploy with "Use existing Build Cache" **unchecked**

### Issue: Browser caching old bundle
**Solution**: Hard refresh or clear browser cache

### Issue: CDN caching
**Solution**: The `vercel.json` headers should prevent HTML caching, but you may need to wait a few minutes for CDN cache to expire

## Expected Console Output

When working correctly, you should see:
```
🔍 AppContext Environment Variables: {
  environmentId: "f189fcee-05bc-0069-1f34-a1d35d692446",
  collection: "default",
  ...
}
🔍 AppContext Data: {
  environmentId: "f189fcee-05bc-0069-1f34-a1d35d692446",
  collection: "default",
  ...
}
🔍 LandingPage Context: {
  environmentId: "f189fcee-05bc-0069-1f34-a1d35d692446",
  collection: "default",
  ...
}
🔍 Fetching landing page with: {
  environmentId: "f189fcee-05bc-0069-1f34-a1d35d692446",
  collection: "default",
  ...
}
🔍 Landing page fetch result: {
  found: true,
  codename: "your_landing_page_codename",
  collection: "default",
  title: "Your Camping Landing Page Title"
}
```

If you see the old environment ID in any of these logs, the build needs to be redone with the correct environment variables.

