const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data));
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('QR code generation failed');
  }
};

module.exports = { generateQRCode };