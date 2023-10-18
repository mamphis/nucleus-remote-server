import { $Enums, Notification } from "@prisma/client";
import { Request } from "express";
import db from "./db";
import { ValidKeys } from "./locale/en";
import { $t } from "./locale/locale";

const createNotification = async (severity: $Enums.NotificationSeverity, message: ValidKeys, tenantId: string, ...args: string[]) => {
    await db.notification.create({
        data: {
            message: JSON.stringify({ message, args }),
            severity,
            tenantId,
        }
    });
}

const parseNotificationText = (notification: Pick<Notification, 'message'>, req: Request): Pick<Notification, 'message'> => {
    const { message, args } = JSON.parse(notification.message);
    notification.message = $t(req, message, ...args);

    return notification;
}

export {
    createNotification,
    parseNotificationText
};
