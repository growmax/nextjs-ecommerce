# Product Detail Page - SEO Testing Guide

This guide provides comprehensive instructions for testing the SEO implementation of the product detail pages.

## 🎯 Overview

The product detail page has been implemented with:
- ✅ Server-side rendering with ISR
- ✅ Dynamic meta tags (title, description, keywords)
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ JSON-LD structured data (Product schema)
- ✅ Breadcrumb schema
- ✅ Dynamic XML sitemap
- ✅ SEO-friendly URLs with brand + product name + ID

## 📋 Pre-Testing Checklist

### 1. Environment Setup
- [ ] Ensure `NEXT_PUBLIC_BASE_URL` is set in `.env` or `.env.local`
- [ ] Verify `OPENSEARCH_URL` is configured
- [ ] Confirm tenant credentials are available
- [ ] Build the application: `npm run build`
- [ ] Start production server: `npm run start`

### 2. Sample Product URLs
Based on the URL structure: `/[locale]/products/[brand-slug]-[product-name-slug]-[product-id]`

Example URLs:
```
/en/products/generics-bearing-j-06-07-prod0000012390
/es/products/generics-bearing-j-06-07-prod0000012390
/fr/products/generics-bearing-j-06-07-prod0000012390
```

## 🔍 Testing Procedures

### Test 1: Meta Tags Validation

**Steps:**
1. Navigate to a product page
2. View page source (Right-click → View Page Source)
3. Verify the following meta tags are present:

**Expected Meta Tags:**
```html
<!-- Basic Meta Tags -->
<title>BEARING - J.06.07 - Generics</title>
<meta name="description" content="Product description here..." />
<meta name="keywords" content="..." />

<!-- Open Graph Tags -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="..." />
<meta property="og:image" content="..." />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en" />

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />

<!-- Canonical URL -->
<link rel="canonical" href="..." />

<!-- Alternate Languages -->
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="es" href="..." />
<link rel="alternate" hreflang="fr" href="..." />
```

**Pass Criteria:** All meta tags are present and correctly populated

---

### Test 2: JSON-LD Structured Data Validation

**Tool:** [Google Rich Results Test](https://search.google.com/test/rich-results)

**Steps:**
1. Open the Google Rich Results Test tool
2. Enter your product page URL or paste the HTML
3. Click "Test URL" or "Test Code"

**Expected Results:**
- ✅ Product schema detected
- ✅ No errors in structured data
- ✅ All required properties present:
  - name
  - image
  - description
  - sku
  - brand
  - offers (price, availability)

**Sample JSON-LD Output:**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "BEARING - J.06.07",
      "description": "...",
      "image": ["..."],
      "sku": "1000147191",
      "mpn": "Prod0000012390",
      "brand": {
        "@type": "Brand",
        "name": "Generics"
      },
      "offers": {
        "@type": "Offer",
        "url": "...",
        "priceCurrency": "INR",
        "price": 737,
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    }
  ]
}
```

**Pass Criteria:** 
- No errors or warnings
- Preview shows product information correctly

---

### Test 3: Facebook Sharing Preview

**Tool:** [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

**Steps:**
1. Go to Facebook Sharing Debugger
2. Enter your product page URL
3. Click "Debug"
4. Review the preview

**Expected Results:**
- ✅ Correct title displayed
- ✅ Product description shown
- ✅ Product image loaded (high quality)
- ✅ No warnings about missing og: tags

**Pass Criteria:**
- Preview looks professional
- All information is accurate
- Image is clear and properly sized

---

### Test 4: Twitter Card Validation

**Tool:** [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Steps:**
1. Go to Twitter Card Validator
2. Enter your product page URL
3. Click "Preview card"

**Expected Results:**
- ✅ Card type: summary_large_image
- ✅ Title displayed
- ✅ Description shown
- ✅ Image rendered correctly

**Pass Criteria:**
- Card renders as "summary_large_image"
- All information displays correctly

---

### Test 5: Lighthouse SEO Audit

**Tool:** Chrome DevTools Lighthouse

**Steps:**
1. Open product page in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Select "SEO" category
5. Click "Analyze page load"

**Target Scores:**
- ✅ SEO Score: 90+
- ✅ Performance Score: 85+
- ✅ Accessibility Score: 90+
- ✅ Best Practices Score: 90+

**Key Checks:**
- Document has a meta description ✓
- Document has a valid hreflang ✓
- Page has successful HTTP status code ✓
- Links have descriptive text ✓
- Document has a title element ✓
- Image elements have alt attributes ✓
- robots.txt is valid ✓

**Pass Criteria:** SEO score 90 or higher

---

### Test 6: Sitemap Validation

**Steps:**
1. Navigate to `/en/products/sitemap.xml`
2. Verify XML sitemap loads
3. Check for product entries

**Expected Results:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/en/products/generics-bearing-j-06-07-prod0000012390</loc>
    <lastmod>2025-08-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="..." />
    <xhtml:link rel="alternate" hreflang="es" href="..." />
    <xhtml:link rel="alternate" hreflang="fr" href="..." />
  </url>
  ...
</urlset>
```

**Pass Criteria:**
- Sitemap generates without errors
- Product URLs are included
- Alternate language links present
- lastmod dates are current

---

### Test 7: Core Web Vitals

**Tool:** Chrome DevTools or [PageSpeed Insights](https://pagespeed.web.dev/)

**Target Metrics:**
- ✅ Largest Contentful Paint (LCP): < 2.5s
- ✅ First Input Delay (FID): < 100ms
- ✅ Cumulative Layout Shift (CLS): < 0.1
- ✅ First Contentful Paint (FCP): < 1.8s

**Steps:**
1. Open PageSpeed Insights
2. Enter product page URL
3. Run analysis for both Mobile and Desktop

**Pass Criteria:**
- All Core Web Vitals in "Good" range (green)
- Overall performance score 85+

---

### Test 8: Mobile Responsiveness

**Steps:**
1. Open product page in Chrome
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test various device sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Check:**
- [ ] Images load correctly
- [ ] Text is readable without zoom
- [ ] Buttons are tap-friendly (min 44px)
- [ ] No horizontal scrolling
- [ ] Product gallery works on mobile
- [ ] Add to cart button accessible

**Pass Criteria:** Page renders well on all device sizes

---

### Test 9: Crawlability Check

**Tool:** Chrome DevTools Network Tab

**Steps:**
1. Open product page with DevTools Network tab open
2. Check initial HTML response
3. Verify server-side rendering

**Expected Results:**
- ✅ HTML contains full product information (not just loading state)
- ✅ Status code: 200 OK
- ✅ Response time < 1s
- ✅ No JavaScript required to see product details

**Pass Criteria:**
- Product content visible in initial HTML
- No client-side rendering for critical content

---

### Test 10: URL Structure Validation

**Check:**
- [ ] URLs include brand name: ✓
- [ ] URLs include product name: ✓
- [ ] URLs include product ID: ✓
- [ ] URLs are lowercase: ✓
- [ ] Special characters handled: ✓
- [ ] URLs are under 100 characters: ✓

**Example Valid URLs:**
```
✅ /en/products/generics-bearing-j-06-07-prod0000012390
✅ /en/products/milwaukee-m18-impact-driver-prod0000012345
✅ /en/products/dewalt-cordless-drill-20v-prod0000067890
```

**Invalid URLs:**
```
❌ /en/products/12390 (missing brand and name)
❌ /en/products/Product (missing ID)
❌ /en/products/BEARING-J.06.07 (uppercase, special chars)
```

**Pass Criteria:** All product URLs follow SEO-friendly structure

---

## 📊 Testing Results Template

Use this template to record your test results:

```markdown
## SEO Testing Results - [Date]

### Environment
- Base URL: 
- Tenant: 
- Test Product: 

### Test Results

| Test | Status | Score/Result | Notes |
|------|--------|--------------|-------|
| Meta Tags | ✅/❌ | | |
| JSON-LD Structured Data | ✅/❌ | | |
| Facebook Sharing | ✅/❌ | | |
| Twitter Card | ✅/❌ | | |
| Lighthouse SEO | ✅/❌ | /100 | |
| Sitemap | ✅/❌ | | |
| Core Web Vitals | ✅/❌ | LCP: , FID: , CLS: | |
| Mobile Responsive | ✅/❌ | | |
| Crawlability | ✅/❌ | | |
| URL Structure | ✅/❌ | | |

### Overall Assessment
- [ ] All tests passed
- [ ] SEO implementation is production-ready
- [ ] Issues found: [list any issues]

### Recommendations
1. 
2. 
3. 
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Structured Data Not Detected
**Solution:** Ensure JSON-LD script tag is in the page head or body. Check for JSON syntax errors.

### Issue 2: Images Not Loading in Social Previews
**Solution:** 
- Use absolute URLs for images
- Ensure images are publicly accessible
- Image size should be at least 1200x630px for optimal display

### Issue 3: Low Lighthouse Score
**Solution:**
- Enable ISR (already implemented)
- Optimize images with next/image (already implemented)
- Reduce bundle size with code splitting

### Issue 4: Meta Tags Missing
**Solution:** Check that `generateMetadata()` function is exporting correctly and using `await` when fetching product data.

---

## 🚀 Post-Testing Actions

After completing all tests:

1. **Document Results:** Fill out the testing results template
2. **Address Issues:** Create tickets for any failing tests
3. **Validate Fixes:** Re-test after fixes are applied
4. **Monitor:** Set up ongoing monitoring with:
   - Google Search Console
   - Bing Webmaster Tools
   - Real User Monitoring (RUM)

---

## 📚 Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Product Documentation](https://schema.org/Product)
- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Core Web Vitals](https://web.dev/vitals/)
- [Open Graph Protocol](https://ogp.me/)

---

## ✅ Sign-off

**Tested By:** _________________  
**Date:** _________________  
**Status:** [ ] Approved for Production [ ] Needs Revision  
**Signature:** _________________

