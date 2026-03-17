import twilio from 'twilio';

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID || '',
      process.env.TWILIO_AUTH_TOKEN || ''
    );
  }
  return _client;
}

export async function sendSMS(to: string, body: string) {
  try {
    const message = await getClient().messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER!,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: String(error) };
  }
}
