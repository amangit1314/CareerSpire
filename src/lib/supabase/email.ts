import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { EmailStatus } from '@/types/enums';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  notificationId?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text, userId, notificationId } = options;

  // Skip if Supabase is not configured for emails
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('[Email] Skipping email - Supabase not configured');
    return;
  }

  // Create email log entry
  const emailLog = await prisma.emailLog.create({
    data: {
      userId: userId || null,
      notificationId: notificationId || null,
      to,
      subject,
      status: EmailStatus.QUEUED,
    },
  });

  try {
    // Use Supabase Edge Function or Resend API
    // For now, we'll use a simple fetch to Supabase's email service
    // In production, you'd use Resend or SendGrid via Supabase Edge Function

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      }),
    });

    // Handle case where Edge Function is not deployed
    if (emailResponse.status === 404) {
      console.log('[Email] Edge Function not deployed - skipping email send');
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
          error: 'Email Edge Function not deployed - skipped',
        },
      });
      return; // Don't throw, just skip
    }

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email API error: ${errorText}`);
    }

    const result = await emailResponse.json();

    // Update email log
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: EmailStatus.SENT,
        providerMessageId: result.messageId || null,
      },
    });
  } catch (error: any) {
    // Update email log with error
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: EmailStatus.FAILED,
        error: error.message || 'Unknown error',
      },
    });

    // Don't throw - log the error but don't fail the notification
    console.log('[Email] Failed to send (non-blocking):', error.message);
  }
}

export async function sendEmailTemplate(
  template: 'welcome' | 'mock-result' | 'payment-success' | 'password-reset',
  to: string,
  data: Record<string, any>,
  userId?: string,
  notificationId?: string
): Promise<void> {
  const templates: Record<string, { subject: string; html: (data: any) => string }> = {
    welcome: {
      subject: 'Welcome to CareerSpire!',
      html: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to CareerSpire!</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>Thank you for joining CareerSpire! You now have <strong>3 free mock interviews every month</strong> to get started.</p>
          <p>Start practicing and improve your interview skills today!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Go to Dashboard</a>
        </div>
      `,
    },
    'mock-result': {
      subject: 'Your Mock Interview Results',
      html: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Mock Interview Completed!</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>Your mock interview has been completed with a score of <strong>${d.score}%</strong>.</p>
          <p>${d.feedback || 'Check your dashboard for detailed feedback.'}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/mock/${d.sessionId}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Results</a>
        </div>
      `,
    },
    'payment-success': {
      subject: 'Payment Successful - CareerSpire',
      html: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Payment Successful!</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>Your payment of ₹${d.amount} has been processed successfully.</p>
          <p>Your ${d.tier} subscription is now active.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Go to Dashboard</a>
        </div>
      `,
    },
    'password-reset': {
      subject: 'Reset Your Password - CareerSpire',
      html: (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Password Reset Request</h1>
          <p>Hi ${d.name || 'there'},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${d.resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Reset Password</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">This link expires in 1 hour.</p>
        </div>
      `,
    },
  };

  const templateData = templates[template];
  if (!templateData) {
    throw new Error(`Unknown template: ${template}`);
  }

  await sendEmail({
    to,
    subject: templateData.subject,
    html: templateData.html(data),
    userId,
    notificationId,
  });
}
