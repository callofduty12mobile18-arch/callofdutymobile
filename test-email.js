const nodemailer = require('nodemailer');
const fs = require('fs');

// Simple .env parser
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: (env.SMTP_PASS || '').replace(/\s+/g, '')
  }
});

async function main() {
  console.log('Testing SMTP with user:', env.SMTP_USER);
  try {
    await transporter.verify();
    console.log('SMTP SERVER READY & VERIFIED!');

    const info = await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: 'polonium84r@gmail.com',
      subject: 'CallOfDutyMobile Access Key: Welcome Shivan_ashwin',
      text: 'Welcome to CallOfDutyMobile! Your login credentials: \n\nEmail: polonium84r@gmail.com\nPassword: CODM-PRO-7491\nLogin at: http://localhost:3000/player/login',
      html: '<h2 style="color:#FFE93B;background:#000;padding:20px;">WELCOME TO CALLOFDUTYMOBILE INDIA</h2><p>Your access has been approved!</p><p><strong>Email:</strong> polonium84r@gmail.com<br><strong>Password:</strong> CODM-PRO-7491</p><p><a href="http://localhost:3000/player/login">Login to Player Studio</a></p>'
    });
    console.log('EMAIL SENT SUCCESSFULLY! Message ID:', info.messageId);
  } catch (err) {
    console.error('SMTP SEND ERROR:', err);
  }
}

main();
