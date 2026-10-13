import { store } from '../db/store';
import { Notification, NotificationType } from '../types';

export interface ExternalNotificationPayload {
  toPhone?: string;
  toEmail?: string;
  title: string;
  body: string;
  actionUrl?: string;
}

// Extensible Notification Gateway (WhatsApp / Email / Push Abstraction)
export class NotificationGateway {
  static async sendInternal(payload: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    referenceId?: string;
    referenceUrl?: string;
  }): Promise<Notification> {
    const notif = store.createNotification({
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      reference_id: payload.referenceId,
      reference_url: payload.referenceUrl,
    });

    // Fire & Forget external notification pipeline (Simulated WhatsApp/Email in production)
    this.sendExternal({
      title: payload.title,
      body: payload.message,
      actionUrl: payload.referenceUrl,
    }).catch(() => {
      // Intentionally silent in prototype
    });

    return notif;
  }

  static async sendExternal(payload: ExternalNotificationPayload): Promise<boolean> {
    // Abstraction point: In production, integrate with WhatsApp Cloud API / Twilio / SendGrid / FCM
    if (process.env.ENABLE_EXTERNAL_NOTIFICATION === 'true') {
      console.log(`[EXTERNAL NOTIFICATION DISPATCHED] To: ${payload.toPhone || payload.toEmail} | ${payload.title}`);
    }
    return true;
  }
}
