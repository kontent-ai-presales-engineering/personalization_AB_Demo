# Algolia Configuration Setup & Testing

## Task 1.1 Complete ✅

Algolia configuration and types have been set up. Here's what was created:

### Files Created

1. **`src/config/algolia.ts`** - Algolia client configuration
   - Creates read-only search client
   - Exports configuration for react-instantsearch
   - Includes validation and error handling

2. **`src/types/algolia.ts`** - TypeScript types for Algolia search results
   - `AlgoliaCampground` interface matching index structure
   - Search metadata and facet types
   - Search state for URL synchronization

3. **`src/config/algolia.test.ts`** - Test utilities
   - `testAlgoliaConnection()` - Tests connectivity
   - `testAlgoliaSearch()` - Tests search functionality
   - Available in browser console as `window.testAlgolia`

4. **`src/components/search/AlgoliaTest.tsx`** - Test component
   - Visual test interface
   - Connection testing
   - Search testing
   - Environment variable validation

## Testing Instructions

### 1. Set Environment Variables

Add these to your `.env` file:

```bash
VITE_ALGOLIA_APP_ID=your_app_id_here
VITE_ALGOLIA_SEARCH_KEY=your_search_key_here
VITE_ALGOLIA_INDEX_NAME=campgrounds  # Optional, defaults to 'campgrounds'
```

**Important:** The search key should be a **read-only** API key for client-side use.

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test Algolia Configuration

#### Option A: Visual Test Page
Navigate to: `http://localhost:3000/test-algolia`

This page provides:
- Connection test button
- Search test with query input
- Environment variable status
- Detailed results display

#### Option B: Browser Console
Open browser console (F12) and run:

```javascript
// Test connection
await window.testAlgolia.connection()

// Test search
await window.testAlgolia.search('texas')
```

### 4. Expected Results

**Connection Test:**
- ✅ Configured: Yes
- ✅ Connected: Yes
- Index Name: campgrounds (or your custom name)
- Total Results in Index: [number of campgrounds]

**Search Test:**
- Query: [your search term]
- Hits Returned: [number of results]
- Total Hits: [total matching results]
- Processing Time: [ms]
- Sample Result: [first result object]

## Troubleshooting

### "Algolia is not configured"
- Check that `.env` file exists and contains the required variables
- Restart the dev server after adding environment variables
- Verify variable names start with `VITE_`

### "Search client is null"
- Verify `VITE_ALGOLIA_APP_ID` is set correctly
- Verify `VITE_ALGOLIA_SEARCH_KEY` is set correctly
- Check for typos in variable names

### Connection Errors
- Verify your Algolia App ID is correct
- Verify your search key has read permissions
- Check that the index name matches your Algolia index
- Ensure the index exists and has data

### No Results
- Verify the index is populated with campground data
- Check that the index name matches (`campgrounds` by default)
- Try an empty search query to see all results

## Next Steps

Once testing is successful:

1. ✅ Task 1.1 is complete - Algolia configuration is ready
2. Proceed to Task 1.2 - Build search page with InstantSearch
3. Remove test route from `main.tsx` when ready (optional)

## Cleanup

After testing is complete, you can optionally remove:
- `src/components/search/AlgoliaTest.tsx` (test component)
- `src/config/algolia.test.ts` (test utilities - or keep for debugging)
- Test route from `main.tsx` (line with `path: "test-algolia"`)

The core configuration files (`algolia.ts` and `algolia.ts` types) should remain.

