import nodemailer from 'nodemailer';
import { escapeHtml, safeHttpUrl } from '@/lib/security';

interface SendCredentialsOptions {
  to: string;
  ign: string;
  password: string;
  fullName?: string;
  isInvitation?: boolean;
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://callofdutymobile-one.vercel.app';
}

export function getEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'callofduty12mobile18@gmail.com';
  const rawPass = process.env.SMTP_PASS || 'REDACTED_PASSWORD';
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPlayerCredentialsEmail({
  to,
  ign,
  password,
  fullName,
  isInvitation = false,
}: SendCredentialsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('[MAILER] SMTP credentials not configured. Skipping email dispatch.');
      return { success: false, error: 'SMTP not configured' };
    }

    const siteUrl = getSiteUrl();
    const loginUrl = `${siteUrl}/player/login`;
    const fromAddress = process.env.SMTP_FROM || `"CallOfDutyMobile Esports" <${process.env.SMTP_USER || 'callofduty12mobile18@gmail.com'}>`;

    const badgeText = isInvitation ? 'OFFICIAL PLAYER INVITATION' : 'INDIAN MobileRoster ARCHIVE';
    const mainHeading = isInvitation ? 'YOU HAVE BEEN INVITED' : 'YOUR ACCESS CREDENTIALS';
    const leadMessage = isInvitation
      ? `You have been officially invited by the platform administrators to join the <strong style="color: #FFE93B;">CallOfDutyMobile</strong> competitive community platform.`
      : `Your request to join the <strong style="color: #FFE93B;">CallOfDutyMobile</strong> competitive community platform has been approved by the platform administrators.`;
    const boxTitle = isInvitation ? 'INVITATION ACCESS CREDENTIALS' : 'SECURE LOGIN CREDENTIALS';
    const buttonText = isInvitation ? 'ACCEPT INVITATION & LOGIN &rarr;' : 'LOGIN TO PLAYER STUDIO &rarr;';
    const emailSubject = isInvitation
      ? `Official Invitation: Welcome to CallOfDutyMobile, ${ign}`
      : `CallOfDutyMobile Access Key: Welcome ${ign}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isInvitation ? 'Your CallOfDutyMobile Official Player Invitation' : 'Your CallOfDutyMobile Player Access Credentials'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border: 1px solid #2A2A2A; border-radius: 4px; overflow: hidden;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background-color: #FFE93B;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #2A2A2A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #FFE93B; font-weight: bold; margin-bottom: 8px;">
                      ${badgeText}
                    </span>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #FFFFFF;">
                      ${mainHeading}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #ADABAB;">
                Hello <strong style="color: #FFFFFF;">${escapeHtml(fullName || ign)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #ADABAB;">
                ${leadMessage}
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; border: 1px solid #FFE93B; border-radius: 4px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <span style="display: block; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #837D72; font-weight: bold; margin-bottom: 16px;">
                      ${boxTitle}
                    </span>

                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #837D72; width: 120px;">
                          LOGIN EMAIL:
                        </td>
                        <td style="padding-bottom: 12px; font-size: 14px; font-family: monospace; color: #FFFFFF; font-weight: bold;">
                          ${escapeHtml(to)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #837D72;">
                          PLAYER IGN:
                        </td>
                        <td style="padding-bottom: 12px; font-size: 14px; font-family: monospace; color: #FFFFFF; font-weight: bold;">
                          ${escapeHtml(ign)}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; text-transform: uppercase; color: #837D72;">
                          ACCESS KEY:
                        </td>
                        <td style="font-size: 16px; font-family: monospace; color: #FFE93B; font-weight: 900; letter-spacing: 1px;">
                          ${escapeHtml(password)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="background-color: #FFE93B; border-radius: 2px;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #000000; text-decoration: none;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps List -->
              <div style="border-top: 1px solid #2A2A2A; padding-top: 20px;">
                <span style="display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #837D72; font-weight: bold; margin-bottom: 10px;">
                  HOW TO GET STARTED:
                </span>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 20px; color: #ADABAB;">
                  <li style="margin-bottom: 6px;">Click the button above or visit <a href="${loginUrl}" style="color: #FFE93B; text-decoration: none;">${loginUrl}</a></li>
                  <li style="margin-bottom: 6px;">Log in using your email and the Access Key shown above.</li>
                  <li style="margin-bottom: 6px;">Build your profile: set your competitive role, team tag, tournament history, and socials.</li>
                  <li>Click <strong>Save & Publish Profile</strong> to go live in the national directory!</li>
                </ol>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0F0F0F; border-top: 1px solid #2A2A2A; font-size: 11px; color: #837D72; text-align: center;">
              This is an official communication from the CallOfDutyMobile Indian Platform.<br>
              ${isInvitation ? 'You received this email because an administrator invited you to the platform.' : 'If you did not request this access, you can disregard this email.'}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: emailSubject,
      text: isInvitation
        ? `Welcome to CallOfDutyMobile!\n\nYou have been officially invited by the platform administrators.\n\nLogin URL: ${loginUrl}\nEmail: ${to}\nAccess Key / Password: ${password}\n\nLog in to build and publish your official player profile.`
        : `Welcome to CallOfDutyMobile!\n\nYour request has been approved.\n\nLogin URL: ${loginUrl}\nEmail: ${to}\nAccess Key / Password: ${password}\n\nLog in to build and publish your official player profile.`,
      html: htmlContent,
    });

    console.log(`[MAILER] ${isInvitation ? 'Invitation' : 'Credentials'} email dispatched successfully to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[MAILER ERROR] Failed to send email to ${to}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export interface BroadcastEmailOptions {
  toList: string[];
  subject: string;
  badgeTitle?: string;
  headline: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
}

export async function sendBroadcastEmail({
  toList,
  subject,
  badgeTitle = 'OFFICIAL ANNOUNCEMENT',
  headline,
  bodyContent,
  ctaText,
  ctaUrl,
}: BroadcastEmailOptions): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('[MAILER] SMTP credentials not configured for broadcast.');
      return { success: false, sentCount: 0, failedCount: toList.length, error: 'SMTP not configured in environment' };
    }

    const fromAddress = process.env.SMTP_FROM || `"CallOfDutyMobile India" <${process.env.SMTP_USER || 'callofduty12mobile18@gmail.com'}>`;
    const siteUrl = getSiteUrl();
    const targetCtaUrl = ctaUrl
      ? safeHttpUrl(ctaUrl.startsWith('/') ? `${siteUrl}${ctaUrl}` : ctaUrl) ?? undefined
      : undefined;

    const formattedBody = escapeHtml(bodyContent)
      .replace(/\n\n/g, '</p><p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #D1D1D1;">')
      .replace(/\n/g, '<br>');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border: 1px solid #2A2A2A; border-radius: 4px; overflow: hidden;">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background-color: #FFE93B;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #2A2A2A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #FFE93B; font-weight: bold; margin-bottom: 8px;">
                      ${escapeHtml(badgeTitle)}
                    </span>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #FFFFFF; line-height: 28px;">
                      ${escapeHtml(headline || subject)}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="font-size: 14px; line-height: 24px; color: #D1D1D1; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 24px; color: #D1D1D1;">
                  ${formattedBody}
                </p>
              </div>

              <!-- CTA Button if provided -->
              ${
                targetCtaUrl && ctaText
                  ? `
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; margin-bottom: 16px;">
                <tr>
                  <td align="center" style="background-color: #FFE93B; border-radius: 2px;">
                    <a href="${escapeHtml(targetCtaUrl)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #000000; text-decoration: none;">
                      ${escapeHtml(ctaText)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0F0F0F; border-top: 1px solid #2A2A2A; font-size: 11px; color: #837D72; text-align: center;">
              You received this official dispatch as a registered player on <a href="${siteUrl}" style="color: #FFE93B; text-decoration: none;">CallOfDutyMobile India</a>.<br>
              Indian MobileRoster Competitive Archive & Editorial Platform.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    let sentCount = 0;
    let failedCount = 0;

    // Send emails
    for (const recipient of toList) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject,
          text: `${subject}\n\n${bodyContent}\n\n${targetCtaUrl ? `Link: ${targetCtaUrl}` : ''}`,
          html: htmlContent,
        });
        sentCount++;
      } catch (sendErr) {
        console.error(`[MAILER] Failed broadcast to ${recipient}:`, sendErr);
        failedCount++;
      }
    }

    return { success: sentCount > 0 || toList.length === 0, sentCount, failedCount };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[MAILER] Broadcast dispatch error:', errorMsg);
    return { success: false, sentCount: 0, failedCount: toList.length, error: errorMsg };
  }
}

/**
 * Dispatch security alert email when an account is temporarily locked due to repeated failed logins.
 */
export async function sendAccountLockoutEmail({
  to,
  ip,
  lockoutMinutes = 30,
}: {
  to: string;
  ip: string;
  lockoutMinutes?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('[MAILER] SMTP credentials not configured. Skipping lockout alert dispatch.');
      return { success: false, error: 'SMTP not configured' };
    }

    const fromAddress = process.env.SMTP_FROM || `"CallOfDutyMobile Security" <${process.env.SMTP_USER || 'callofduty12mobile18@gmail.com'}>`;
    const siteUrl = getSiteUrl();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Security Alert: Account Locked</title></head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border: 1px solid #FF3D00; border-radius: 4px; overflow: hidden;">
          <tr><td height="4" style="background-color: #FF3D00;"></td></tr>
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #2A2A2A;">
              <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #FF3D00; font-weight: bold;">SECURITY ALERT</span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">Account Temporarily Locked</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #D1D1D6;">
                Your account (<strong style="color: #FFFFFF;">${escapeHtml(to)}</strong>) has been locked for <strong>${lockoutMinutes} minutes</strong> due to 5 consecutive failed login attempts.
              </p>
              <div style="background-color: #1F1F1F; border: 1px solid #333333; padding: 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; color: #ADABAB;">
                <div><strong>Originating IP:</strong> ${escapeHtml(ip)}</div>
                <div style="margin-top: 6px;"><strong>Protection:</strong> Automated Brute Force Defense</div>
              </div>
              <p style="margin: 0; font-size: 13px; color: #8E8E93;">
                If this wasn't you, someone may be attempting to access your account. Please change your credentials once access is restored or contact support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0F0F0F; border-top: 1px solid #2A2A2A; font-size: 11px; color: #666666; text-align: center;">
              CallOfDutyMobile Security Automated Monitor &middot; <a href="${siteUrl}" style="color: #FFE93B; text-decoration: none;">Platform Portal</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `🚨 Security Alert: Account Locked (${to})`,
      text: `Your CallOfDutyMobile account (${to}) has been temporarily locked for ${lockoutMinutes} minutes following 5 failed login attempts from IP: ${ip}.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[MAILER] Account lockout email failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch email verification link on player registration/signup.
 */
export async function sendEmailVerificationEmail({
  to,
  ign,
  token,
}: {
  to: string;
  ign: string;
  token: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('[MAILER] SMTP credentials not configured. Skipping email verification dispatch.');
      return { success: false, error: 'SMTP not configured' };
    }

    const siteUrl = getSiteUrl();
    const verificationUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const fromAddress = process.env.SMTP_FROM || `"CallOfDutyMobile Verification" <${process.env.SMTP_USER || 'callofduty12mobile18@gmail.com'}>`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify Your Player Email</title></head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border: 1px solid #2A2A2A; border-radius: 4px; overflow: hidden;">
          <tr><td height="4" style="background-color: #FFE93B;"></td></tr>
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #2A2A2A;">
              <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #FFE93B; font-weight: bold;">IDENTITY VERIFICATION</span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 900; text-transform: uppercase; color: #FFFFFF;">Verify Your Player Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #D1D1D6;">
                Welcome <strong style="color: #FFE93B;">${escapeHtml(ign)}</strong>! Please verify your email address to activate your player profile.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #ADABAB;">
                Your competitive profile will remain in <strong>DRAFT</strong> mode until your email address has been verified.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #FFE93B; color: #000000; font-weight: 900; text-decoration: none; border-radius: 2px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
                  VERIFY EMAIL ADDRESS &rarr;
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #666666;">
                Or copy and paste this verification URL into your browser:<br>
                <a href="${verificationUrl}" style="color: #FFE93B; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0F0F0F; border-top: 1px solid #2A2A2A; font-size: 11px; color: #666666; text-align: center;">
              CallOfDutyMobile Player Verification &middot; Link expires in 24 hours.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Verify Your Email: Welcome to CallOfDutyMobile, ${ign}`,
      text: `Welcome ${ign}! Please verify your email to activate your player profile by clicking: ${verificationUrl}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[MAILER] Verification email failed:', errorMsg);
    return { success: false, error: errorMsg };
  }
}


