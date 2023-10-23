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
        const data = await db.requestMetrics.findMany({
            select: {
                avgDuration: true,
                maxDuration: true,
                hitCount: true,
                bucketTime: true,
                statusCodes: {
                    select: {
                        statusCode: true,
                        hitCount: true,
                    }
                }
            },
            where: {
                bucketTime: {
                    gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
                }
            }
        });   

        const histogram = data.map((metric) => ({
            bucketTime: metric.bucketTime,
            hitCount: metric.hitCount,
            avgDuration: metric.avgDuration,
            maxDuration: metric.maxDuration,
            statusCodes: metric.statusCodes.map((statusCode) => ({
                statusCode: statusCode.statusCode,
                hitCount: statusCode.hitCount,
            })),
        }));

        res.json({
            histogram,
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
        const { min, max } = req.query;
        let filter = {};
        if (min && max) {
            filter = {
                gte: new Date(min),
                lte: new Date(max),
            }
        }

        const requestMetrics = await db.requestMetrics.groupBy({
            by: 'requestPath',
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

    router.get('/requestHistogram', auth('special:admin'), async (req, res, next) => {
        const histogram = await db.requestMetrics.groupBy({
            by: 'bucketTime',
            _sum: { hitCount: true },
            _avg: { avgDuration: true },
            _max: { maxDuration: true },
            where: {
                bucketTime: {
                    gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
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

    return router;
}