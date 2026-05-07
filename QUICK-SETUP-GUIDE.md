# Quick Setup Guide - SEO Implementation

## 🚀 Quick Start (5 Minutes)

### Step 1: Environment Variables
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and update:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your domain in production
```

### Step 2: Install Dependencies (if needed)
```bash
npm install
```

### Step 3: Test Locally
```bash
npm run dev
```

Visit these URLs to verify:
- http://localhost:3000/sitemap.xml ✅
- http://localhost:3000/robots.txt ✅
- http://localhost:3000/manifest.json ✅

### Step 4: Check Meta Tags
Open any page and view source (Ctrl+U), look for:
- `<title>` tags
- `<meta name="description">` tags
- `<meta property="og:*">` tags (Open Graph)
- `<script type="application/ld+json">` (Structured Data)

## 📸 Create Required Images

### Priority 1: Open Graph Images (1200x630px)
Create these in `/frontend/public/`:
```
/og-image.jpg       - Homepage hero image
/og-trainers.jpg    - Trainers working out
/og-plans.jpg       - Gym equipment/facilities
/og-contact.jpg     - Gym exterior or contact visual
```

**Quick tip**: Use Canva or similar tools with template size 1200x630px

### Priority 2: PWA Icons
Create these in `/frontend/public/`:
```
/icon-192x192.png   - Small icon
/icon-384x384.png   - Medium icon
/icon-512x512.png   - Large icon
/logo.png           - Full logo
```

**Quick tip**: Use your gym logo and resize to these dimensions

### Priority 3: Favicon
Already exists at `/frontend/app/favicon.ico` ✅

## 🔧 Configuration Updates

### Update Business Information
Edit `frontend/app/layout.tsx` (lines 70-95):
```typescript
// Update these values:
telephone: '+1-555-123-4567',        // Your phone
email: 'info@ironpulse.com',         // Your email
streetAddress: '123 Fitness Street', // Your address
// ... etc
```

### Update Social Media Links
Edit `frontend/app/layout.tsx` (lines 105-109):
```typescript
sameAs: [
  'https://facebook.com/your-page',
  'https://twitter.com/your-handle',
  'https://instagram.com/your-handle',
],
```

## ✅ Testing Checklist

### Local Testing
- [ ] Run `npm run dev`
- [ ] Check `/sitemap.xml` loads
- [ ] Check `/robots.txt` loads
- [ ] View page source and verify meta tags
- [ ] Test on mobile device

### Online Validation
1. **Structured Data**
   - Go to: https://search.google.com/test/rich-results
   - Enter your URL
   - Fix any errors

2. **Open Graph**
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Check preview

3. **Twitter Cards**
   - Go to: https://cards-dev.twitter.com/validator
   - Enter your URL
   - Check preview

4. **Page Speed**
   - Go to: https://pagespeed.web.dev/
   - Enter your URL
   - Aim for 90+ score

## 🌐 Deployment

### Before Deploying
1. Update `NEXT_PUBLIC_APP_URL` in production environment
2. Ensure all images are uploaded
3. Test build: `npm run build`
4. Test production: `npm start`

### After Deploying
1. **Google Search Console**
   - Add property: https://search.google.com/search-console
   - Verify ownership
   - Submit sitemap: `https://yourdomain.com/sitemap.xml`

2. **Get Verification Codes**
   - Google: Search Console → Settings → Verification
   - Copy the meta tag code
   - Add to `app/layout.tsx` verification section

3. **Monitor**
   - Check indexing status (takes 1-7 days)
   - Monitor search performance
   - Fix any crawl errors

## 🎯 Priority Actions

### Week 1
- [ ] Add all required images
- [ ] Update business information
- [ ] Deploy to production
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools

### Week 2
- [ ] Set up Google Analytics
- [ ] Monitor indexing status
- [ ] Check for crawl errors
- [ ] Verify rich results appear

### Month 1
- [ ] Monitor keyword rankings
- [ ] Analyze traffic sources
- [ ] Optimize underperforming pages
- [ ] Build initial backlinks

## 🆘 Troubleshooting

### Sitemap not loading?
```bash
# Check file exists
ls frontend/app/sitemap.ts

# Rebuild
npm run build
```

### Meta tags not showing?
- Clear browser cache
- Check page source (not inspector)
- Verify metadata.ts files are in correct folders

### Images not loading?
- Check file paths in `/public/`
- Verify image names match code
- Check Next.js image configuration

### Structured data errors?
- Use Google Rich Results Test
- Validate JSON-LD syntax
- Check for missing required fields

## 📞 Need Help?

### Resources
- Next.js Docs: https://nextjs.org/docs
- Schema.org: https://schema.org/
- Google Search Central: https://developers.google.com/search

### Common Issues
1. **404 on sitemap**: Rebuild the app
2. **No meta tags**: Check metadata exports
3. **Images 404**: Verify public folder structure
4. **Slow performance**: Optimize images, enable caching

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Pages appear in Google Search (1-7 days)
- ✅ Rich snippets show in search results
- ✅ Social shares show proper previews
- ✅ Lighthouse SEO score is 90+
- ✅ Mobile-friendly test passes
- ✅ Core Web Vitals are green

## 📈 Next Steps

After basic setup:
1. Create blog section for content marketing
2. Add customer testimonials
3. Implement review schema
4. Build local citations
5. Create social media profiles
6. Start link building campaign

---

**Estimated Setup Time**: 30-60 minutes
**Time to First Results**: 1-2 weeks
**Full SEO Impact**: 3-6 months

Good luck! 🚀
