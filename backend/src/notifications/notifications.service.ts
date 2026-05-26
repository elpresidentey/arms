import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';

export type NotificationAudience = {
  userIds?: string[];
  roles?: string[];
  residentLocation?: {
    ward?: string | null;
    street?: string | null;
  };
  broadcast?: boolean;
};

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type NamedRecipient = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resendApiKey?: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly supportEmail: string;

  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly configService: ConfigService,
  ) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'ARMS <notifications@your-verified-domain.com>',
    );
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '');
    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL', 'support@example.com');
  }

  notify(event: string, payload: unknown, audience?: NotificationAudience) {
    this.notificationsGateway.emitToAudience(event, payload, audience);
  }

  async sendNotification(data: {
    title: string;
    message: string;
    type: string;
    userId?: string | null;
    roles?: string[];
    data?: unknown;
  }): Promise<void> {
    this.notify('notification', {
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId,
      data: data.data,
      timestamp: new Date().toISOString(),
    }, {
      userIds: data.userId ? [data.userId] : undefined,
      roles: data.roles,
    });
  }

  async sendEmail(payload: EmailPayload): Promise<string | null> {
    if (!this.resendApiKey || this.resendApiKey.includes('replace-with') || this.resendApiKey.includes('your-')) {
      this.logger.warn(`Email skipped for ${payload.to}: RESEND_API_KEY is not configured with a live key`);
      return null;
    }

    if (this.fromEmail.includes('your-verified-domain.com')) {
      this.logger.warn(`Email skipped for ${payload.to}: RESEND_FROM_EMAIL must use a verified Resend sender`);
      return null;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'arms-backend/1.0',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      const data = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

      if (!response.ok) {
        this.logger.warn(`Email failed for ${payload.to}: ${response.status} ${data?.message || response.statusText}`);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      this.logger.warn(`Email failed for ${payload.to}: ${(error as Error).message}`);
      return null;
    }
  }

  async sendWelcomeEmail(user: NamedRecipient) {
    if (!user.email) {
      return null;
    }

    const name = this.getDisplayName(user);
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to ARMS',
      html: this.wrapEmail(
        'Welcome to ARMS',
        `<p>Hello ${this.escapeHtml(name)},</p>
        <p>Your ARMS profile is ready. You can now schedule collections, report waste issues, track recycling activity, and view wallet updates from your dashboard.</p>
        <p><a href="${this.frontendUrl}/dashboard">Open your dashboard</a></p>`,
      ),
      text: `Hello ${name}, your ARMS profile is ready. Open your dashboard: ${this.frontendUrl}/dashboard`,
    });
  }

  async sendReportUpdateEmail(user: NamedRecipient, report: { ticketNumber?: string; title?: string; status?: string }) {
    if (!user.email) {
      return null;
    }

    const ticket = report.ticketNumber || 'your report';
    return this.sendEmail({
      to: user.email,
      subject: `Report update: ${ticket}`,
      html: this.wrapEmail(
        'Report update',
        `<p>Hello ${this.escapeHtml(this.getDisplayName(user))},</p>
        <p>Your report <strong>${this.escapeHtml(ticket)}</strong>${report.title ? ` (${this.escapeHtml(report.title)})` : ''} is now marked as <strong>${this.escapeHtml(report.status || 'updated')}</strong>.</p>
        <p><a href="${this.frontendUrl}/reports">View reports</a></p>`,
      ),
      text: `Your report ${ticket} is now marked as ${report.status || 'updated'}. View reports: ${this.frontendUrl}/reports`,
    });
  }

  async sendServiceRequestUpdateEmail(
    user: NamedRecipient,
    request: { requestNumber?: string; title?: string; status?: string; scheduledFor?: Date | string | null },
  ) {
    if (!user.email) {
      return null;
    }

    const requestNumber = request.requestNumber || 'your service request';
    const scheduleText = request.scheduledFor
      ? `<p>Scheduled for: <strong>${this.escapeHtml(new Date(request.scheduledFor).toLocaleString())}</strong></p>`
      : '';

    return this.sendEmail({
      to: user.email,
      subject: `Service request update: ${requestNumber}`,
      html: this.wrapEmail(
        'Service request update',
        `<p>Hello ${this.escapeHtml(this.getDisplayName(user))},</p>
        <p>Your service request <strong>${this.escapeHtml(requestNumber)}</strong>${request.title ? ` (${this.escapeHtml(request.title)})` : ''} is now <strong>${this.escapeHtml(request.status || 'updated')}</strong>.</p>
        ${scheduleText}
        <p><a href="${this.frontendUrl}/service-requests">View service requests</a></p>`,
      ),
      text: `Your service request ${requestNumber} is now ${request.status || 'updated'}. View service requests: ${this.frontendUrl}/service-requests`,
    });
  }

  async sendWithdrawalConfirmationEmail(
    user: NamedRecipient,
    transaction: { amount?: number | string; balanceAfter?: number | string; id?: string },
  ) {
    if (!user.email) {
      return null;
    }

    const amount = Number(transaction.amount || 0).toFixed(2);
    const balanceAfter = Number(transaction.balanceAfter || 0).toFixed(2);

    return this.sendEmail({
      to: user.email,
      subject: 'Withdrawal request received',
      html: this.wrapEmail(
        'Withdrawal request received',
        `<p>Hello ${this.escapeHtml(this.getDisplayName(user))},</p>
        <p>We received your withdrawal request for <strong>${amount}</strong>.</p>
        <p>Your wallet balance after this request is <strong>${balanceAfter}</strong>.</p>
        <p>Reference: ${this.escapeHtml(transaction.id || 'pending')}</p>`,
      ),
      text: `We received your withdrawal request for ${amount}. Wallet balance after this request: ${balanceAfter}.`,
    });
  }

  async sendAdminInviteEmail(options: {
    to: string;
    inviteLink: string;
    invitedByName?: string | null;
    expiresAt: Date | string;
    note?: string | null;
  }) {
    const expiry = new Date(options.expiresAt).toLocaleString();
    const noteBlock = options.note
      ? `<p>Note from the sender: ${this.escapeHtml(options.note)}</p>`
      : '';

    return this.sendEmail({
      to: options.to,
      subject: 'Your ARMS admin invite',
      html: this.wrapEmail(
        'ARMS admin invite',
        `<p>Hello,</p>
        <p>${this.escapeHtml(options.invitedByName || 'An ARMS administrator')} invited you to join the ARMS admin workspace.</p>
        <p>This invite expires on <strong>${this.escapeHtml(expiry)}</strong>.</p>
        ${noteBlock}
        <p><a href="${options.inviteLink}">Accept your admin invite</a></p>
        <p>If the button does not open, use this link directly:</p>
        <p>${this.escapeHtml(options.inviteLink)}</p>`,
      ),
      text: `${options.invitedByName || 'An ARMS administrator'} invited you to join the ARMS admin workspace. This invite expires on ${expiry}. Accept invite: ${options.inviteLink}`,
    });
  }

  async notifyWardResidents(ward: string, message: string, data: Record<string, unknown>) {
    this.notify('schedule-update', { message, ...data, ward }, { residentLocation: { ward } });
  }

  private getDisplayName(user: NamedRecipient) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'there';
  }

  private wrapEmail(title: string, body: string) {
    return `
      <div style="font-family: Arial, sans-serif; color: #17202a; line-height: 1.55; max-width: 640px;">
        <h1 style="font-size: 22px; color: #0f766e;">${this.escapeHtml(title)}</h1>
        ${body}
        <p style="margin-top: 32px; color: #64748b; font-size: 13px;">
          Need help? Contact ${this.escapeHtml(this.supportEmail)}.
        </p>
      </div>
    `;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
