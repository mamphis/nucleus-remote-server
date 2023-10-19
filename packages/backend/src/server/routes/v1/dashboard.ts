import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/', auth(), async (req, res: AuthResponse, next) => {
        const { user } = res.locals;
        // get history data for the tenant
        const historyLengthInDays = 14;
        const history = await db.history.findMany({
            where: {
                tenantId: user.tenantId,
                timestamp: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * historyLengthInDays),
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            distinct: ['timestamp', 'type'],
        });

        // Format the data for the history in correct format
        const historyData = history.reduce((acc, cur) => {
            if (!acc[cur.type]) {
                acc[cur.type] = [];
            }

            acc[cur.type].push({
                date: cur.timestamp,
                value: cur.data,
            });

            return acc;
        }, {} as Record<string, { date: Date, value: number }[]>);

        // get statistics for tenant clients
        const clients = await db.client.findMany({
            where: {
                tenantId: user.tenantId,
            },
        });

        const tenant = await db.tenant.findFirstOrThrow({
            where: {
                id: user.tenantId,
            }
        });

        return res.json({
            historyData,
            tenantStatistics: {
                clientCount: clients.length,
                activeClients: clients.filter((c) => c.active).length,
                maxClients: tenant.maxClients,
            },
            osDistribution: clients.reduce((acc, cur) => { 
                // commulate the os distribution, if os is empty string, set it to unknown
                const os = cur.os || 'unknown';
                acc[os] = acc[os] || 0;
                acc[os] += 1;
                return acc;
            }, {} as Record<string, number>),
        });
    });

    return router;
}