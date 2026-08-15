/**
 * Email Service for Transactional Notifications (e.g. Password Reset)
 */

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string | null;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const name = userName || 'Admin';
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Portfolio CMS <onboarding@resend.dev>';

  const subject = 'Atur Ulang Kata Sandi — Portfolio CMS';

  const textContent = `
Halo ${name},

Kami menerima permintaan untuk mengatur ulang kata sandi akun admin Portfolio CMS Anda.
Klik tautan berikut untuk membuat kata sandi baru (berlaku selama 1 jam):

${resetUrl}

Jika Anda tidak merasa melakukan permintaan ini, Anda dapat mengabaikan email ini dengan aman. Kata sandi Anda tidak akan berubah.

Salam,
Portfolio CMS
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #0d0d0d; border: 1px solid #262626; border-radius: 16px; padding: 40px; text-align: left;">
          <tr>
            <td>
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: bold; font-size: 14px; padding: 4px 10px; border-radius: 6px;">Portfolio CMS</span>
              </div>
              
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.5px;">Permintaan Atur Ulang Kata Sandi</h1>
              
              <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Halo <strong style="color: #ffffff;">${name}</strong>, kami menerima permintaan untuk mengatur ulang kata sandi akun admin Anda. Klik tombol di bawah untuk membuat kata sandi baru:
              </p>
              
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #ffffff;">
                    <a href="${resetUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; letter-spacing: 0.2px;">
                      Atur Ulang Kata Sandi &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #1f1f23; padding-top: 20px;">
                Tautan ini kedaluwarsa dalam <strong>1 jam</strong> dan hanya dapat digunakan satu kali.<br><br>
                Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut di browser Anda:<br>
                <a href="${resetUrl}" style="color: #a1a1aa; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
              </p>
              
              <p style="color: #52525b; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0;">
                Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun dan kata sandi Anda tetap aman.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // If Resend API Key is configured, send actual email via Resend API
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send email via Resend API:', errorData);
        return { success: false, error: 'Gagal mengirim email.' };
      }

      return { success: true };
    } catch (err) {
      console.error('Email sending exception:', err);
      return { success: false, error: 'Gagal mengirim email.' };
    }
  }

  // Development Fallback: Log reset link cleanly in server console
  console.log('\n======================================================');
  console.log('📧 [DEV EMAIL SIMULATOR] PASSWORD RESET LINK:');
  console.log(`To: ${to}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('======================================================\n');

  return { success: true };
}
