import type { ApiUser } from "./user"
type ApiNotificationSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ApiNotification = {
    approvedBy?: Pick<ApiUser, 'username'>;
    id: string;
    createdAt: string;
    message: string;
    severity: ApiNotificationSeverity;
    unread: boolean;
};