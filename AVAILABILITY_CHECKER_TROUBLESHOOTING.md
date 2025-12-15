# Availability Checker Troubleshooting

## Issue: Loading Spinner Goes Indefinitely

If the "Check Availability" button shows a loading spinner that never completes, this is usually because:

### Most Common Cause: Wrong Dev Server

**Problem:** You're running `npm run dev` instead of `vercel dev`

**Solution:**
- Stop `npm run dev` if it's running
- Run `vercel dev` instead
- The availability API route (`/api/availability`) only works with `vercel dev`

**Why:** 
- `npm run dev` uses Vite, which doesn't handle serverless functions
- `vercel dev` uses Vercel's development server, which handles both frontend and API routes

### Check Console Logs

When you click "Check Availability", you should see:

**Expected logs:**
```
[AvailabilityChecker] Button clicked
[AvailabilityChecker] Setting shouldFetch to true
[AvailabilityChecker] Fetching availability: {...}
[AvailabilityChecker] Request URL: /api/availability?campgroundId=...
[AvailabilityChecker] Response received, status: 200
[AvailabilityChecker] Response data: {...}
```

**If you see:**
- Request URL logged but no response → Wrong dev server (use `vercel dev`)
- Network error → API route not accessible
- Timeout error → API route not responding

### Check Network Tab

1. Open DevTools → Network tab
2. Click "Check Availability"
3. Look for request to `/api/availability`

**What to check:**
- Status: Should be 200 (OK)
- If pending forever → Wrong dev server
- If 404 → API route not found
- If CORS error → Check API route CORS headers

### Verify API Route is Working

**Test directly in browser:**
```
http://localhost:3000/api/availability?campgroundId=test&checkIn=2025-12-15&checkOut=2025-12-16
```

**Expected:** JSON response with availability data
**If 404 or error:** API route not configured correctly

### Check Terminal/Server Logs

If running `vercel dev`, you should see:
```
[Availability API] Request received: {...}
[Availability API] Parsed query params: {...}
[Availability API] Simulating 200ms delay...
[Availability API] Generated site types: [...]
[Availability API] Sending response: {...}
```

**If no logs:** API route isn't being called (wrong dev server)

### Common Issues

#### Issue 1: "Request timed out"
**Cause:** Using `npm run dev` instead of `vercel dev`
**Fix:** Switch to `vercel dev`

#### Issue 2: "Network error"
**Cause:** API route not accessible
**Fix:** 
- Ensure `vercel dev` is running
- Check `vercel.json` has API route configured
- Verify API route file exists at `api/availability/index.ts`

#### Issue 3: "404 Not Found"
**Cause:** API route not deployed/configured
**Fix:**
- Check `vercel.json` includes `api/availability/index.ts` in functions
- Verify file exists at correct path
- Restart `vercel dev`

#### Issue 4: Infinite loading, no errors
**Cause:** Fetch request hanging (usually wrong dev server)
**Fix:** Use `vercel dev` instead of `npm run dev`

### Quick Fix Checklist

1. ✅ Stop `npm run dev` if running
2. ✅ Run `vercel dev` instead
3. ✅ Click "Check Availability" again
4. ✅ Check console for `[AvailabilityChecker]` logs
5. ✅ Check Network tab for `/api/availability` request
6. ✅ Check terminal for `[Availability API]` logs

### Still Not Working?

**Check these:**
- Is `vercel dev` actually running? (Check terminal)
- Are there any errors in terminal?
- Does the API route work when tested directly in browser?
- Is `campgroundId` being passed correctly? (Check console logs)

**Share these details:**
1. Console logs (all `[AvailabilityChecker]` messages)
2. Network tab screenshot (showing `/api/availability` request)
3. Terminal output (if running `vercel dev`)
4. What you see visually (loading spinner, error message, etc.)
