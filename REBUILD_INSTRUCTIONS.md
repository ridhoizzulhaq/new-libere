---
noteId: "527f8eb0b95711f08d56a990e7f97797"
tags: []

---

# Complete Rebuild Instructions

Service worker cache is too aggressive. We need to rebuild from scratch.

## Steps:

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Delete all build artifacts and caches
cd /Users/ridhoizzulhaq/new-libere
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# 3. Restart dev server
npm run dev
```

## In Browser:

1. **Close ALL tabs** of localhost:5173
2. **Close browser completely**
3. **Open new Incognito window**
4. Navigate to http://localhost:5173
5. Check console for "Version 3.0"

## If STILL doesn't work:

The PWA plugin is rebuilding service worker on every start.
We need to REMOVE the plugin temporarily:

Edit `vite.config.ts`:
- Comment out the entire `VitePWA(...)` plugin
- Restart dev server
- Test without PWA

## Expected Console Output:

```
📱 [EpubReaderScreen] Component loaded - Version 3.0
🔍 [isSupabaseStorageUrl v2.0] Checking URL: libere-books/...
✅ Detected as storage path
```

If you see this, the book will load successfully!
