---
noteId: "1c24d780b98911f085232b6f21e34475"
tags: []

---

# EPUB File Protection - Security Analysis

## Current Implementation

### Storage Method
EPUB files are stored in **Supabase Storage** bucket `libere-books` with the following structure:
```
libere-books/
  └── {bookId}/
      └── book.epub
```

### Access Control

**Current Flow** (as of January 2025):
1. User requests to read book via `/read-book/:id`
2. Frontend checks ownership/borrow via blockchain (`EpubReaderScreen.tsx`)
3. If verified, generates **signed URL** with 1-hour expiry
4. Downloads EPUB as ArrayBuffer
5. Passes ArrayBuffer to ReactReader component

**Code Location**: `src/pages/EpubReaderScreen.tsx:273-298`
```typescript
const signedUrl = await getSignedEpubUrl(book.id);
const response = await fetch(signedUrl);
const arrayBuffer = await response.arrayBuffer();
```

## Security Vulnerabilities

### 🔴 Critical: Direct URL Access

**Issue**: Signed URLs can be shared or leaked, allowing unauthorized access.

**Attack Vectors**:
1. **URL Sharing**: User shares signed URL with others (valid for 1 hour)
2. **Browser History**: Signed URL stored in browser history/cache
3. **Network Interception**: MITM can capture signed URL
4. **DevTools**: User can inspect network tab and copy signed URL
5. **Downloaded Files**: User can extract raw EPUB from ArrayBuffer

### 🟡 Medium: Storage Bucket Exposure

**Current Setup**:
- Bucket: `libere-books` (Supabase Storage)
- Files: Publicly readable via signed URL
- Expiry: 1 hour (set in `getSignedEpubUrl`)

**Risks**:
- Signed URL can be used by anyone within 1-hour window
- No server-side verification of ownership during file download
- Brute-force possible if token generation is predictable

### 🟢 Low: ArrayBuffer Extraction

**Issue**: User can extract EPUB from memory using DevTools.

**Impact**: Low - requires technical knowledge and happens client-side only.

## Mitigation Strategies

### Option 1: Server-Side Verification (Recommended)

**Implementation**:
1. Create backend API endpoint `/api/epub/read`
2. Verify ownership/borrow on server before generating signed URL
3. Return short-lived token (5-10 minutes)
4. Rate limit requests per user

**Pros**:
- ✅ Server validates ownership on every request
- ✅ Cannot bypass frontend checks
- ✅ Can implement rate limiting
- ✅ Centralized access logging

**Cons**:
- ❌ Requires backend infrastructure
- ❌ Additional latency for verification

**Example**:
```typescript
// Backend: /api/epub/read
export async function GET(request: Request) {
  const { bookId, userAddress } = parseRequest(request);

  // Verify ownership via blockchain
  const hasAccess = await verifyBookAccess(userAddress, bookId);

  if (!hasAccess) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Generate short-lived signed URL (5 min)
  const signedUrl = await supabase.storage
    .from('libere-books')
    .createSignedUrl(`${bookId}/book.epub`, 300);

  return Response.json({ url: signedUrl.data.signedUrl });
}
```

### Option 2: Encrypted Storage

**Implementation**:
1. Encrypt EPUB files before uploading to storage
2. Store decryption key on-chain or in secure backend
3. Decrypt client-side using Web Crypto API
4. Pass decrypted ArrayBuffer to ReactReader

**Pros**:
- ✅ Files useless without decryption key
- ✅ Protection even if storage is compromised
- ✅ No backend needed (if key stored on-chain)

**Cons**:
- ❌ Complex implementation
- ❌ Performance overhead (encryption/decryption)
- ❌ Key management complexity

**Example**:
```typescript
// Encrypt before upload
const encryptedEpub = await encryptFile(epubBuffer, encryptionKey);
await supabase.storage.from('libere-books').upload(path, encryptedEpub);

// Decrypt before reading
const encryptedBuffer = await fetch(signedUrl).then(r => r.arrayBuffer());
const decryptedBuffer = await decryptFile(encryptedBuffer, decryptionKey);
```

### Option 3: Watermarked EPUBs

**Implementation**:
1. Generate unique EPUB per user with watermark
2. Embed user address/email in EPUB metadata
3. Store per-user EPUBs: `{bookId}/{userAddress}/book.epub`
4. Track who downloaded what

**Pros**:
- ✅ Traceable if leaked
- ✅ Deterrent against sharing
- ✅ Legal evidence for enforcement

**Cons**:
- ❌ Storage overhead (multiple copies per book)
- ❌ Processing time to generate watermarked EPUB
- ❌ Complex EPUB manipulation

### Option 4: Time-Limited Streaming

**Implementation**:
1. Stream EPUB chunks instead of full download
2. Require periodic re-authentication
3. Chunks expire after N seconds

**Pros**:
- ✅ Harder to download full file
- ✅ Can revoke access mid-session
- ✅ Reduced bandwidth for non-readers

**Cons**:
- ❌ Poor user experience (needs constant connection)
- ❌ Complex streaming implementation
- ❌ ReactReader may not support streaming

## Current Protection Mechanisms

### ✅ Implemented

1. **Signed URLs with Expiry** (1 hour)
   - Location: `src/utils/supabaseStorage.ts`
   - Prevents indefinite URL access

2. **Frontend Access Verification**
   - Location: `src/pages/EpubReaderScreen.tsx:45-218`
   - Checks blockchain for ownership/borrow before loading

3. **Visual Watermark Overlay**
   - Location: `src/components/reader/WatermarkOverlay.tsx`
   - Displays user address on top of reader UI

4. **DevTools Protection** (Basic)
   - Location: `src/pages/EpubReaderScreen.tsx:335-431`
   - Blocks right-click, F12, Ctrl+U, etc.

### ❌ Not Implemented

1. **Server-Side Verification**
2. **File Encryption**
3. **Per-User Watermarked EPUBs**
4. **Rate Limiting**
5. **Access Logging/Audit Trail**
6. **DRM Integration**

## Recommendations

### Immediate (Low-Effort)

1. **Reduce Signed URL Expiry**
   ```typescript
   // Change from 3600 (1 hour) to 300 (5 minutes)
   const { data, error } = await supabase.storage
     .from(EPUB_BUCKET)
     .createSignedUrl(path, 300); // 5 min expiry
   ```

2. **Add Access Logging**
   ```typescript
   // Log every EPUB access
   await supabase.from('EpubAccessLog').insert({
     book_id: bookId,
     user_address: userAddress,
     access_method: hasNFT ? 'ownership' : 'borrow',
     timestamp: new Date().toISOString()
   });
   ```

3. **Embed User Address in EPUB Metadata** (on-the-fly)
   ```typescript
   // Add metadata to EPUB before passing to reader
   const epubWithMetadata = await addMetadataToEpub(arrayBuffer, {
     reader: userAddress,
     accessed_at: new Date().toISOString()
   });
   ```

### Medium-Term (Moderate Effort)

1. **Implement Backend Verification API**
   - Use Next.js API routes or separate backend
   - Verify ownership on every EPUB request
   - Return very short-lived signed URLs (5-10 min)

2. **Add Rate Limiting**
   - Limit EPUB downloads per user per hour
   - Prevents abuse via URL sharing

3. **Enhanced Watermarking**
   - Dynamic watermarks at random positions
   - Harder to crop out

### Long-Term (High Effort)

1. **Full Encryption System**
   - Encrypt all EPUBs at rest
   - Decryption keys managed on-chain or secure backend
   - Client-side decryption using Web Crypto API

2. **DRM Integration**
   - Use existing DRM solutions (Adobe Content Server, Readium LCP)
   - Enterprise-grade protection
   - Device binding and offline limits

## Legal & Policy Considerations

### Terms of Service

**Recommended additions**:
1. Prohibition against sharing URLs or downloaded files
2. Right to revoke access for violations
3. Tracking and monitoring clause
4. Legal consequences for piracy

### DMCA Protection

**For publishers/authors**:
1. Implement DMCA takedown process
2. Agent registration for copyright claims
3. Repeat infringer policy

### Privacy Considerations

**Balance security with privacy**:
1. Access logging must comply with GDPR/privacy laws
2. User notification about tracking
3. Data retention policies

## Implementation Priority

### Phase 1 (Immediate) ✅
- [x] Frontend access verification (already done)
- [ ] Reduce signed URL expiry to 5 minutes
- [ ] Add basic access logging
- [ ] Document security limitations in UI

### Phase 2 (Next Sprint) 🟡
- [ ] Backend verification API
- [ ] Rate limiting per user
- [ ] Enhanced logging with audit trail
- [ ] Improved DevTools detection

### Phase 3 (Future) 🔵
- [ ] Encryption at rest
- [ ] Per-user watermarked EPUBs
- [ ] DRM integration research
- [ ] Legal framework setup

## Conclusion

**Current Status**:
- ✅ Basic protection via frontend verification + signed URLs
- ⚠️ Vulnerable to URL sharing and technical users
- ❌ No server-side enforcement

**Risk Level**: 🟡 **Medium**
- Suitable for testnet/MVP
- Requires hardening before mainnet launch
- Good enough for closed beta

**Recommended Next Step**:
Implement **backend verification API** to add server-side enforcement without major UX changes.

## Related Files

- [src/pages/EpubReaderScreen.tsx](src/pages/EpubReaderScreen.tsx) - Reader with access verification
- [src/utils/supabaseStorage.ts](src/utils/supabaseStorage.ts) - Signed URL generation
- [src/components/reader/WatermarkOverlay.tsx](src/components/reader/WatermarkOverlay.tsx) - Visual watermark
- [LIBRARY_ACCESS_VERIFICATION_FIX.md](LIBRARY_ACCESS_VERIFICATION_FIX.md) - Access verification fix
