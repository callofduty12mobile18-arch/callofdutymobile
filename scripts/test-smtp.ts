import nodemailer from 'nodemailer';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

console.log('User:', env.SMTP_USER);
console.log('Host:', env.SMTP_HOST);
console.log('Port:', env.SMTP_PORT);
console.log('Pass length:', (env.SMTP_PASS || '').length);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: (env.SMTP_PASS || '').replace(/\s+/g, ''),
  },
});

async function run() {
  try {
    await transporter.verify();
    console.log('>>> SMTP CONNECTION VERIFIED SUCCESSFULLY! <<<');

    const result = await transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: 'polonium84r@gmail.com',
      subject: 'CallOfDutyMobile Access Key: Welcome Shivan_ashwin',
      text: 'Your credentials: Email: polonium84r@gmail.com | Pass: CODM-PRO-7491',
      html: '<h2 style="color:#FFE93B;background:#000;padding:16px;">CallOfDutyMobile India</h2><p>Your request has been approved! Login at <a href="http://localhost:3000/player/login">http://localhost:3000/player/login</a></p><p>Email: <b>polonium84r@gmail.com</b><br>Access Key: <b>CODM-PRO-7491</b></p>',
    });

    console.log('>>> EMAIL DISPATCHED SUCCESSFULLY! Message ID:', result.messageId);
  } catch (err) {
    console.error('>>> SMTP ERROR:', err);
  }
}

run();
