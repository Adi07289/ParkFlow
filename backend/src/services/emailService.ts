import nodemailer, { Transporter } from 'nodemailer';

type OTPPurpose = 'register' | 'login';

interface EmailDeliveryResult {
  success: boolean;
  message: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 1025);
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) {
      throw new Error('SMTP_HOST is not configured');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  private getFromAddress(): string {
    return process.env.SMTP_FROM || 'ParkFlow <no-reply@parkflow.local>';
  }

  private getDeliveryMessage(): string {
    const host = process.env.SMTP_HOST || '';
    const port = process.env.SMTP_PORT || '1025';

    if (host === 'mailpit' || (host === 'localhost' && port === '1025')) {
      return 'OTP sent successfully. Open the local inbox at http://127.0.0.1:8025';
    }

    return 'OTP sent successfully. Check your email inbox';
  }

  async sendOTPEmail(email: string, otp: string, purpose: OTPPurpose): Promise<EmailDeliveryResult> {
    try {
      const transporter = this.getTransporter();
      const actionLabel = purpose === 'register' ? 'complete your registration' : 'sign in to ParkFlow';

      await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: `Your ParkFlow OTP for ${purpose === 'register' ? 'registration' : 'login'}`,
        text: `Your ParkFlow OTP is ${otp}. Use this code to ${actionLabel}. This code expires in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="margin: 0 0 16px; color: #111827;">ParkFlow OTP</h2>
            <p style="margin: 0 0 16px; color: #374151;">
              Use the code below to ${actionLabel}. This code expires in 5 minutes.
            </p>
            <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 12px; text-align: center;">
              <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #111827;">${otp}</span>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              If you did not request this code, you can ignore this email.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: this.getDeliveryMessage(),
      };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        message: 'Failed to send OTP email',
      };
    }
  }
}

export const emailService = new EmailService();
