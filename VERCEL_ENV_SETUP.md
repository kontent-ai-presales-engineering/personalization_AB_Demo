# Vercel Environment Variables Setup

## Issue: Outdated Content on Vercel

If your Vercel deployment is showing outdated content while local development shows the correct camping content, this is likely due to environment variables pointing to the wrong Kontent.ai environment.

## Solution: Update Vercel Environment Variables

### Step 1: Access Vercel Project Settings

1. Go to your Vercel dashboard
2. Select your project: `personalization-ab-demo`
3. Go to **Settings** → **Environment Variables**

### Step 2: Update Environment Variables

Ensure these environment variables are set correctly:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_ENVIRONMENT_ID` | `f189fcee-05bc-0069-1f34-a1d35d692446` | Camping environment ID |
| `VITE_DELIVERY_API_KEY` | Your Delivery API key | API key for the camping environment |
| `VITE_COLLECTION` | `default` | Collection codename (optional, defaults to "default") |

### Step 3: Clear Build Cache

After updating environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Check **"Use existing Build Cache"** → **UNCHECK IT** (to force a fresh build)
5. Click **"Redeploy"**

### Step 4: Verify

After redeployment, check:
- Landing page shows camping content
- Articles show camping topics
- Navigation works correctly

## Troubleshooting

### If content still doesn't update:

1. **Check Environment Variable Scope**: Make sure variables are set for **Production** environment (not just Preview/Development)

2. **Verify API Key**: Ensure `VITE_DELIVERY_API_KEY` has access to the camping environment (`f189fcee-05bc-0069-1f34-a1d35d692446`)

3. **Check Browser Cache**: Hard refresh the Vercel URL (Ctrl+Shift+R or Cmd+Shift+R)

4. **Verify Build Logs**: Check Vercel build logs to see which environment ID is being used

### Quick Check Command

You can verify which environment ID is being used by checking the build logs for:
```
Environment ID: f189fcee-05bc-0069-1f34-a1d35d692446
```

If you see a different ID, the environment variables need to be updated.

