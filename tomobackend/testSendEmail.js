// Example usage of sendEmail utility
// Copy .env.example -> .env and set EMAIL_USER and EMAIL_PASS to try sending a real email.

const sendEmail = require('./utils/sendEmail');
const readline = require('readline');

const argvTo = (() => {
  const idx = process.argv.indexOf('--to');
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
})();

const recipient = process.env.RECIPIENT || argvTo || process.env.TEST_RECIPIENT || null;
const autoYes = process.argv.includes('--yes');

const fakeTicket = {
  _id: '64f3c0e5b9a1f2d3c4e5f678',
  name: 'Real Recipient',
  orderId: 'ORD12345',
  status: 'resolved'
};

async function confirmAndSend() {
  if (!recipient) {
    console.error('No recipient provided. Set RECIPIENT env var or use --to recipient@example.com');
    process.exit(1);
  }

  console.log('About to send email to:', recipient);

  if (!autoYes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Proceed? Type YES to continue: ', async (answer) => {
      rl.close();
      if (answer.trim() === 'YES') {
        await sendEmail(recipient, fakeTicket);
      } else {
        console.log('Aborted.');
      }
    });
  } else {
    await sendEmail(recipient, fakeTicket);
  }
}

confirmAndSend();
