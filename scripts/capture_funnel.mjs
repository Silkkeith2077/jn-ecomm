import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--disable-gpu'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

  // 1. Mobile Cart
  await page.goto('http://127.0.0.1:3000/catalog/study-abroad', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Add to inquiry'));
    if (btn) btn.click();
  });
  await page.goto('http://127.0.0.1:3000/cart', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'video/public/cart-mobile.png' });
  console.log('Saved cart-mobile.png');

  // 2. Mobile Checkout
  await page.goto('http://127.0.0.1:3000/checkout', { waitUntil: 'networkidle2' });
  await page.type('input[name="name"]', 'Sarah Jenkins');
  await page.type('input[name="email"]', 'sarah.j@example.com');
  await page.type('input[name="phone"]', '+1 408 555 0192');
  await page.type('textarea[name="message"]', 'I need study abroad guidance for Canada. Please send a personalized quote.');
  const cb = await page.$('input[type="checkbox"]');
  if (cb) await cb.click();
  await page.screenshot({ path: 'video/public/checkout-mobile.png' });
  console.log('Saved checkout-mobile.png');

  // 3. Mobile Contact
  await page.goto('http://127.0.0.1:3000/contact', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'video/public/contact-mobile.png' });
  console.log('Saved contact-mobile.png');

  console.log('All mobile funnel screenshots captured successfully!');
} finally {
  await browser.close();
}
