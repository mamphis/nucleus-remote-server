import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/sqlMetrics', auth('special:admin'), async (req, res: AuthResponse, next) => {
        const { min, max } = req.query;
        let filter = {};
        if (min && max) {
            filter = {
                gte: new Date(min),
                lte: new Date(max),
            }
        }

        const statementMetrics = await db.queryMetrics.groupBy({
            by: 'query',
            _sum: { hitCount: true },
            _avg: { avgDuration: true },
            _max: { maxDuration: true },
            where: {
                bucketTime: {
                    gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
                    ...filter,
                }
            }
        });

        res.json({
            statementMetrics: statementMetrics.map((metric) => ({
                query: metric.query,
                hitCount: metric._sum.hitCount,
                avgDuration: metric._avg.avgDuration,
                maxDuration: metric._max.maxDuration,
            })),
        });
    });

    router.get('/sqlHistogram', auth('special:admin'), async (req, res, next) => {
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

        res.json({
            histogram: histogram.map((metric) => ({
                bucketTime: metric.bucketTime,
                hitCount: metric._sum.hitCount,
                avgDuration: metric._avg.avgDuration,
                maxDuration: metric._max.maxDuration,
            })),
        })
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

    router.get('/requestMetrics', auth('special:admin'), async (req, res, next) => {
        const requestMetrics = await db.requestMetrics.groupBy({
            by: 'requestPath',
            _sum: { hitCount: true },
            _avg: { avgDuration: true },
            _max: { maxDuration: true },
            where: {
                bucketTime: {
                    gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
                }
            }
        });

        const metrics = {
            requestMetrics: requestMetrics.map((metric) => ({
                requestPath: metric.requestPath,
                hitCount: metric._sum.hitCount,
                avgDuration: metric._avg.avgDuration,
                maxDuration: metric._max.maxDuration,
            })),
        };

        res.json(metrics);
    });

    return router;
}