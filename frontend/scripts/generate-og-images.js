const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImages() {
  console.log('🚀 Starting OG image generation...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to OG image size
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // Higher quality
  });

  // Load the HTML template
  const templatePath = path.join(__dirname, '../public/og-image-template.html');
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle0' });

  // Generate main OG image
  await page.screenshot({
    path: path.join(__dirname, '../public/og-image.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('✅ Generated: og-image.jpg');

  // Generate Plans page OG image
  await page.evaluate(() => {
    document.querySelector('h2').textContent = 'Membership Plans';
    document.querySelector('.tagline').textContent = 'Flexible Plans Starting at PKR 1,500/month';
    document.querySelector('.features').innerHTML = `
      <div class="feature-item"><span class="check">✓</span><span>Basic - PKR 1,500</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Premium - PKR 3,000</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Elite - PKR 5,000</span></div>
    `;
    document.querySelector('.cta').textContent = 'View Plans';
  });
  await page.screenshot({
    path: path.join(__dirname, '../public/og-plans.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('✅ Generated: og-plans.jpg');

  // Generate Trainers page OG image
  await page.evaluate(() => {
    document.querySelector('h2').textContent = 'Expert Trainers';
    document.querySelector('.tagline').textContent = 'Learn from Certified Fitness Professionals';
    document.querySelector('.features').innerHTML = `
      <div class="feature-item"><span class="check">✓</span><span>Certified Professionals</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Personalized Training</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Nutrition Guidance</span></div>
    `;
    document.querySelector('.cta').textContent = 'Meet Our Team';
  });
  await page.screenshot({
    path: path.join(__dirname, '../public/og-trainers.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('✅ Generated: og-trainers.jpg');

  // Generate Contact page OG image
  await page.evaluate(() => {
    document.querySelector('h2').textContent = 'Get In Touch';
    document.querySelector('.tagline').textContent = 'Visit Our State-of-the-Art Facility';
    document.querySelector('.features').innerHTML = `
      <div class="feature-item"><span class="check">✓</span><span>Free Consultation</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Facility Tour</span></div>
      <div class="feature-item"><span class="check">✓</span><span>Flexible Scheduling</span></div>
    `;
    document.querySelector('.cta').textContent = 'Contact Us';
  });
  await page.screenshot({
    path: path.join(__dirname, '../public/og-contact.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('✅ Generated: og-contact.jpg');

  await browser.close();
  console.log('🎉 All OG images generated successfully!');
}

// Run the generator
generateOGImages().catch(err => {
  console.error('❌ Error generating OG images:', err);
  process.exit(1);
});
