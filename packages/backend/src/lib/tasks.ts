import { schedule } from 'node-cron';
import db, { getQueryMetrics } from "./db";
import { Logger } from "./logger";
import { getRouteMetrics, getStatusMetrics } from '../server/server';

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

const cleanupUnusedKeys = async () => {
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
    // Get the metrics
    const queryMetrics = getQueryMetrics();
    // Save the metrics
    await db.queryMetrics.createMany({
        data: [...queryMetrics.entries()].map(([query, metrics]) => {
            return {
                query,
                ...metrics,
            }
        })
    });

    Logger.debug(`Task "saveQueryMetrics" has run. Saved ${queryMetrics.size} query metrics.`);

    const routeMetrics = getRouteMetrics();
    await db.requestMetrics.createMany({
        data: [...routeMetrics.entries()].map(([requestPath, metrics]) => {
            return {
                requestPath,
                ...metrics,
            }
        })
    });

    Logger.debug(`Task "saveRequestMetrics" has run. Saved ${routeMetrics.size} request metrics.`);

    const statusMetrics = getStatusMetrics();
    await db.statusCodeMetrics.createMany({
        data: [...statusMetrics.entries()].map(([statusCode, metrics]) => {
            return {
                statusCode,
                ...metrics,
            }
        })
    });

    Logger.debug(`Task "saveStatusCodeMetrics" has run. Saved ${statusMetrics.size} status code metrics.`);
}

const init = () => {
    // Run every second day at 03:00 in the morning
    schedule("0 3 * * */2", removeDanglingTasks, { name: 'removeDanglingTasks', runOnInit: true });
    // Run every day at 23:55 in the evening
    schedule('55 23 * * *', saveHistoricData, { name: 'saveHistoricData' });
    // Run every second day at 03:00 in the morning
    schedule("0 3 * * */2", cleanupUnusedKeys, { name: 'cleanupUnusedKeys', runOnInit: true });
    // Run every 30 seconds
    schedule("*/30 * * * * *", saveMetrics, { name: 'saveQueryMetrics' });
}

process.on('beforeExit', () => {
    saveMetrics();
})

export default init;