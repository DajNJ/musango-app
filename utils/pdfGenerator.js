const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateReceiptPDF(booking) {
  const ejsPath = path.join(__dirname, '..', 'views', 'receipt.ejs');

  // ✅ Convert logo image to Base64
  const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
  const logoBase64 = fs.readFileSync(logoPath, 'base64');
  const logoDataURI = `data:image/png;base64,${logoBase64}`;

  // ✅ Render HTML with booking data and embedded logo
  const html = await ejs.renderFile(ejsPath, {
    booking,
    logoDataURI
  });

  // Launch Puppeteer with --no-sandbox flag to avoid sandbox issues
  const browser = await puppeteer.launch({
    headless: true,  // Use headless mode for production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Add these arguments to bypass sandboxing
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateReceiptPDF };
