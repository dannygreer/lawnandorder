import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || '');
  }
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const data = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Lawn & Order <noreply@lindalelawnco.com>',
      to,
      subject,
      html,
    });
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('Resend email error:', error);
    return { success: false, error: String(error) };
  }
}
