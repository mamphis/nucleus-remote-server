import { PrismaClient } from "@prisma/client";
import { schedule } from 'node-cron';
import { Logger } from "./logger";
import db from "./db";

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

const init = () => {
    // Run every second day at 03:00 in the morning
    schedule("0 3 * * */2", removeDanglingTasks, { name: 'removeDanglingTasks', runOnInit: true });
    // Run every day at 23:55 in the evening
    schedule('55 23 * * *', saveHistoricData, { name: 'saveHistoricData' });
}

export default init;