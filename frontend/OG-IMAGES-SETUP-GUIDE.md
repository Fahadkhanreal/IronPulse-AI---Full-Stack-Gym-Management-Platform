# OG Social Media Images - Setup Guide

**Date**: 2026-05-10  
**Status**: ✅ SVG Placeholder Created, Conversion Required

---

## Current Status

✅ **SVG placeholder created** at `frontend/public/og-image.svg`  
⚠️ **JPG conversion required** for optimal social media compatibility

---

## What Are OG Images?

Open Graph (OG) images are displayed when your website is shared on social media platforms like:
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Slack
- Discord

**Standard Size**: 1200x630 pixels (1.91:1 aspect ratio)

---

## Quick Setup (3 Options)

### Option 1: Convert SVG to JPG (Recommended)

**Using Online Tool**:
1. Go to https://cloudconvert.com/svg-to-jpg
2. Upload `frontend/public/og-image.svg`
3. Set quality to 90%
4. Download as `og-image.jpg`
5. Replace the SVG file in `frontend/public/`

**Using ImageMagick (Command Line)**:
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert SVG to JPG
cd "D:\Governor Sindh It Initiative\code\full-stack-gym-website\frontend\public"
magick og-image.svg -quality 90 og-image.jpg
```

**Using Node.js Script**:
```bash
# Install sharp
npm install sharp

# Create convert.js
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('og-image.svg');
sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile('og-image.jpg')
  .then(() => console.log('✅ Converted!'))
  .catch(err => console.error(err));
"
```

---

### Option 2: Use Canva (Professional Look)

1. **Go to Canva**: https://www.canva.com
2. **Create Custom Size**: 1200 x 630 px
3. **Design Your Image**:
   - Use gym/fitness photos from Canva library
   - Add "IronPulse Gym" branding
   - Include tagline: "Transform Your Body, Forge Your Strength"
   - Add key features (24/7 Access, Expert Trainers, AI Support)
   - Use brand colors: Red (#ef4444), Dark (#0f172a)
4. **Download as JPG** (high quality)
5. **Save to**: `frontend/public/og-image.jpg`

**Canva Template Ideas**:
- Search "Gym Social Media Post"
- Search "Fitness Banner"
- Search "Sports Facebook Cover"

---

### Option 3: Use Unsplash + Figma/Photoshop

1. **Download Gym Photo**:
   - Go to https://unsplash.com
   - Search: "gym equipment" or "fitness training"
   - Download high-resolution image (1920x1080 or larger)
   - Recommended photos:
     - https://unsplash.com/photos/gym-equipment-inside-room
     - https://unsplash.com/photos/person-holding-barbell

2. **Edit in Figma/Photoshop**:
   - Create 1200x630px canvas
   - Add gym photo as background
   - Add dark overlay (opacity 50-70%)
   - Add text:
     - Title: "IronPulse Gym" (72px, bold, white)
     - Subtitle: "Transform Your Body" (48px, red)
     - Features: "24/7 Access • Expert Trainers • AI Support"
   - Export as JPG (quality 90%)

3. **Save to**: `frontend/public/og-image.jpg`

---

## Additional OG Images (Optional)

Your code also references these images (currently missing):

### 1. Plans Page OG Image
**Path**: `frontend/public/og-plans.jpg`  
**Content**: Membership plans showcase  
**Text**: "Flexible Membership Plans Starting at PKR 1,500"

### 2. Trainers Page OG Image
**Path**: `frontend/public/og-trainers.jpg`  
**Content**: Trainer team photo  
**Text**: "Meet Our Expert Trainers"

### 3. Contact Page OG Image
**Path**: `frontend/public/og-contact.jpg`  
**Content**: Gym location/facility  
**Text**: "Visit IronPulse Gym Today"

---

## Automated Image Generation (Advanced)

### Using Puppeteer (Screenshot HTML)

Create `scripts/generate-og-images.js`:

```javascript
const puppeteer = require('puppeteer');

async function generateOGImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to OG image size
  await page.setViewport({ width: 1200, height: 630 });
  
  // Create HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 630px;
          width: 1200px;
        }
        .container {
          padding: 80px;
          color: white;
        }
        h1 {
          font-size: 72px;
          margin: 0;
          font-weight: bold;
        }
        h2 {
          font-size: 48px;
          color: #ef4444;
          margin: 20px 0;
        }
        p {
          font-size: 32px;
          color: #94a3b8;
          margin: 40px 0;
        }
        .features {
          font-size: 24px;
          color: #cbd5e1;
          line-height: 1.8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>IronPulse</h1>
        <h2>Gym & Fitness</h2>
        <p>Transform Your Body, Forge Your Strength</p>
        <div class="features">
          ✓ 24/7 Access<br>
          ✓ Expert Trainers<br>
          ✓ AI-Powered Support
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  await page.screenshot({ 
    path: 'frontend/public/og-image.jpg',
    type: 'jpeg',
    quality: 90
  });
  
  await browser.close();
  console.log('✅ OG image generated!');
}

generateOGImage();
```

**Run**:
```bash
npm install puppeteer
node scripts/generate-og-images.js
```

---

## Verification

### Test Your OG Images

1. **Facebook Sharing Debugger**:
   - https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Check if image displays correctly

2. **Twitter Card Validator**:
   - https://cards-dev.twitter.com/validator
   - Enter your URL
   - Verify card preview

3. **LinkedIn Post Inspector**:
   - https://www.linkedin.com/post-inspector/
   - Enter your URL
   - Check preview

4. **Local Testing**:
   ```bash
   # Check if file exists
   ls -lh frontend/public/og-image.jpg
   
   # View in browser
   # Open: http://localhost:3000/og-image.jpg
   ```

---

## Image Optimization

### Compress Images (Reduce File Size)

**Using TinyPNG**:
1. Go to https://tinypng.com
2. Upload `og-image.jpg`
3. Download compressed version
4. Replace original file

**Using ImageOptim (Mac)**:
```bash
brew install imageoptim
imageoptim frontend/public/og-image.jpg
```

**Using sharp (Node.js)**:
```javascript
const sharp = require('sharp');

sharp('og-image.jpg')
  .jpeg({ quality: 85, progressive: true })
  .toFile('og-image-optimized.jpg');
```

**Target File Size**: Under 300KB for fast loading

---

## Current Code References

Your code already references OG images in these files:

1. **`frontend/app/layout.tsx`** (lines 41, 52)
   - Main OG image for all pages

2. **`frontend/app/metadata.ts`** (line 7)
   - Default OG image configuration

3. **`frontend/app/plans/metadata.ts`**
   - Plans page OG image

4. **`frontend/app/trainers/metadata.ts`**
   - Trainers page OG image

5. **`frontend/app/contact/metadata.ts`**
   - Contact page OG image

6. **`frontend/components/seo/StructuredData.tsx`** (lines 24, 68)
   - Structured data references

---

## Best Practices

### Image Content
- ✅ Include brand name/logo
- ✅ Use high-contrast text
- ✅ Keep text readable at small sizes
- ✅ Use brand colors consistently
- ✅ Include a clear call-to-action
- ❌ Don't use too much text
- ❌ Don't use low-quality images
- ❌ Don't forget mobile preview

### Technical Requirements
- **Size**: Exactly 1200x630 pixels
- **Format**: JPG or PNG (JPG preferred for photos)
- **File Size**: Under 300KB
- **Aspect Ratio**: 1.91:1
- **Color Space**: RGB
- **Quality**: 85-90%

### Testing Checklist
- [ ] Image displays on Facebook
- [ ] Image displays on Twitter
- [ ] Image displays on LinkedIn
- [ ] Image displays on WhatsApp
- [ ] Text is readable
- [ ] File size is optimized
- [ ] Image loads quickly

---

## Quick Action Items

**Immediate (5 minutes)**:
1. Convert `og-image.svg` to `og-image.jpg` using online tool
2. Test by opening http://localhost:3000/og-image.jpg
3. Verify in Facebook Sharing Debugger

**Short-term (30 minutes)**:
1. Create professional image using Canva
2. Create additional images for Plans, Trainers, Contact pages
3. Optimize all images for web

**Long-term (Optional)**:
1. Set up automated OG image generation
2. Create dynamic OG images per page
3. Add user-generated content to OG images

---

## Summary

✅ **SVG placeholder created** - Ready for conversion  
📋 **3 conversion options provided** - Choose what works best  
🎨 **Design guidelines included** - Professional results  
🔧 **Automation scripts available** - Scale easily  

**Next Step**: Convert SVG to JPG using Option 1 (fastest) or Option 2 (best quality)
