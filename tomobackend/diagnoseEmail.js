// Diagnostic helper for email auth issues
// Usage: node diagnoseEmail.js

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('--- diagnoseEmail.js ---');
console.log('EMAIL_USER set:', !!EMAIL_USER);
console.log('EMAIL_PASS set:', !!EMAIL_PASS, EMAIL_PASS ? `(length=${EMAIL_PASS.length})` : '');
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('Missing EMAIL_USER or EMAIL_PASS. Please ensure tomobackend/.env exists and contains values.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

transporter.verify()
  .then(() => {
    console.log('Transporter verification: SUCCESS');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Transporter verification: FAILED');
    console.error('Error code:', err && err.code);
    console.error('Response code:', err && err.responseCode);
    console.error('Response text:', err && err.response);
    console.error('Full error:');
    console.error(err);
    process.exit(2);
  });
