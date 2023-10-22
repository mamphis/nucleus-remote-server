import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/metrics', auth('special:admin'), async (req, res: AuthResponse, next) => {

        const statementMetrics = await db.queryMetrics.groupBy({
            by: 'query',
            _sum: { hitCount: true },
            _avg: { avgDuration: true },
            _max: { maxDuration: true },
            where: {
                bucketTime: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
                }
            }
        });

        const histogram = await db.queryMetrics.groupBy({
            by: 'bucketTime',
            _sum: { hitCount: true },
            _avg: { avgDuration: true },
            _max: { maxDuration: true },
            where: {
                bucketTime: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
                }
            }
        });

        const queryMetrics = {
            statementMetrics: statementMetrics.map((metric) => ({
                query: metric.query,
                hitCount: metric._sum.hitCount,
                avgDuration: metric._avg.avgDuration,
                maxDuration: metric._max.maxDuration,
            })),
            histogram: histogram.map((metric) => ({
                bucketTime: metric.bucketTime,
                hitCount: metric._sum.hitCount,
                avgDuration: metric._avg.avgDuration,
                maxDuration: metric._max.maxDuration,
            })),
        };

        res.json({
            queryMetrics,
        });
    });

    router.get('/statistics', auth('special:admin'), async (req, res, next) => {
        const clientCount = await db.client.count();
        const userCount = await db.user.count();
        const tenantCount = await db.tenant.count();
        const groupCount = await db.group.count();
        const taskCount = await db.task.count();
        const notificationCount = await db.notification.count();
        const configurationCount = await db.configuration.count();

        res.json({
            clientCount,
            userCount,
            tenantCount,
            groupCount,
            taskCount,
            notificationCount,
            configurationCount,
        });
    });

    return router;
}