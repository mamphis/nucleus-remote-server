import { schedule } from 'node-cron';
import db, { getQueryMetrics } from "./db";
import { Logger } from "./logger";
import { getRouteMetrics } from '../server/server';

const removeDanglingTasks = async () => {
    const tasksBefore = await db.task.count();

    await db.task.deleteMany({
        where: {
            configuration: {
                is: null,
            }
        }
    });

    const tasksAfter = await db.task.count();
    Logger.info(`Task "removeDanglingTasks" has run. Removed ${tasksBefore - tasksAfter} tasks.`);
}

const saveHistoricData = async () => {
    // Get all clients which have received a ping in the last 24 hours
    const timestamp = new Date(new Date().setHours(0, 0, 0, 0));
    const activeClients = await db.client.groupBy({
        where: {
            lastPing: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            }
        },
        by: ['tenantId'],
        _count: {
            _all: true,
        }
    });

    const totalClients = await db.client.groupBy({
        by: ['tenantId'],
        _count: {
            _all: true,
        }
    });

    // Save the data in the database
    await db.history.createMany({
        data: activeClients.map((client) => {
            return {
                timestamp,
                tenantId: client.tenantId,
                data: client._count._all,
                type: 'activeClients',
            }
        })
    });

    await db.history.createMany({
        data: totalClients.map((client) => {
            return {
                timestamp,
                tenantId: client.tenantId,
                data: client._count._all,
                type: 'totalClients',
            }
        })
    });

    Logger.info(`Task "saveHistoricData" has run. Saved ${activeClients.length} active clients and ${totalClients.length} total clients.`);
}

const removeUnusedKeys = async () => {
    const { count } = await db.key.deleteMany({
        where: {
            clients: {
                none: {},
            },
            id: {
                not: 'default',
            },
        }
    });

    Logger.info(`Task "cleanupUnusedKeys" has run. Removed ${count} unused keys.`);
}

const saveMetrics = async () => {
    const bucketTime = new Date(new Date().setMilliseconds(0));
    // Get the metrics
    const queryMetrics = getQueryMetrics();
    // Save the metrics
    await db.queryMetrics.createMany({
        data: [...queryMetrics.entries()].map(([query, metrics]) => {
            return {
                query,
                bucketTime,
                hitCount: metrics.hitCount,
                avgDuration: metrics.avgDuration,
                maxDuration: metrics.maxDuration,
            }
        })
    });

    Logger.debug(`Task "saveQueryMetrics" has run. Saved ${queryMetrics.size} query metrics.`);

    const routeMetrics = getRouteMetrics();
    await db.requestMetrics.createMany({
        data: [...routeMetrics.entries()].map(([route, metrics]) => {
            return {
                requestPath: route,
                bucketTime,
                hitCount: metrics.hitCount,
                avgDuration: metrics.avgDuration,
                maxDuration: metrics.maxDuration,
            }
        })
    }).then(async () => {
        // Insert Status Codes
        await Promise.all([...routeMetrics.entries()].map(async ([route, metrics]) => {
            // get requestMetric
            const requestMetric = await db.requestMetrics.findFirstOrThrow({
                where: {
                    requestPath: route,
                    bucketTime,
                }
            });

            for (const statusCode in metrics.args) {
                if (metrics.args[statusCode]) {
                    const { hitCount } = metrics.args[statusCode]!;
                    await db.statusCode.create({
                        data: {
                            requestMetricsBucketId: requestMetric.bucketId,
                            statusCode: Number(statusCode),
                            hitCount,
                        }
                    });
                }
            }
        }));
    });

    Logger.debug(`Task "saveRequestMetrics" has run. Saved ${routeMetrics.size} request metrics.`);
}

const removeOldMetrics = async () => {
    const { count: countQueryMetrics } = await db.queryMetrics.deleteMany({
        where: {
            bucketTime: {
                lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
            }
        }
    });

    Logger.info(`Task "removeOldMetrics" has run. Removed ${countQueryMetrics} old query metrics.`);

    const { count: countRequestMetrics } = await db.requestMetrics.deleteMany({
        where: {
            bucketTime: {
                lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
            }
        },
    });

    Logger.info(`Task "removeOldMetrics" has run. Removed ${countRequestMetrics} old request metrics + status codes.`);
};

const init = () => {
    // Run every second day at 03:00 in the morning
    schedule("0 3 * * */2", removeDanglingTasks, { name: 'removeDanglingTasks', runOnInit: true });
    // Run every day at 23:55 in the evening
    schedule('55 23 * * *', saveHistoricData, { name: 'saveHistoricData' });
    // Run every second day at 04:00 in the morning
    schedule("0 4 * * */2", removeUnusedKeys, { name: 'cleanupUnusedKeys', runOnInit: true });
    // Run every minute
    schedule("* * * * *", saveMetrics, { name: 'saveMetrics' });
    // Run every second day at 05:00 in the morning
    schedule("0 5 * * */2", removeOldMetrics, { name: 'removeOldMetrics', runOnInit: true });
}

process.on('beforeExit', () => {
    saveMetrics();
})

export default init;