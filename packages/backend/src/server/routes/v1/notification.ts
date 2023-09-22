import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import { AuthResponse, auth } from '../../../lib/auth';
import { parseNotificationText } from '../../../lib/notification';
const notificationSelect = {
    approvedBy: {
        select: {
            username: true,
        }
    },
    id: true,
    createdAt: true,
    message: true,
    severity: true,
    unread: true,
};

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/', auth(), async (req, res: AuthResponse, next) => {
        const notifications = await db.notification.findMany({
            where: {
                tenantId: res.locals.user.tenantId,
            },
            orderBy: [
                {
                    unread: 'desc',
                },
                {
                    createdAt: 'desc',
                }
            ],
            select: notificationSelect,
        });

        return res.json(notifications.map(n => parseNotificationText(n, req)))
    });

    router.get('/stats', auth(), async (req, res: AuthResponse, next) => {
        const notifications = await db.notification.findMany({
            where: {
                tenantId: res.locals.user.tenantId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: notificationSelect,
        });

        return res.json({
            unread: notifications.filter(n => n.unread).length,
            total: notifications.length,
        });
    });

    router.patch('/:notificationId', auth(), async (req, res: AuthResponse, next) => {
        try {
            const notification = await db.notification.update({
                where: {
                    id: req.params.notificationId,
                },
                data: {
                    unread: false,
                    approvedByUserId: res.locals.user.id,
                }
            });

            return res.json(notification);
        } catch (e: unknown) {
            return next(e);
        }
    });

    return router;
}