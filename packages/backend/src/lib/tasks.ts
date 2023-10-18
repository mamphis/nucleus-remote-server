import { PrismaClient } from "@prisma/client";
import { schedule } from 'node-cron';
import { Logger } from "./logger";

const removeDanglingTasks = async () => {
    const db = new PrismaClient();
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

const init = () => {
    // Run every second day at 03:00 in the morning
    schedule("0 3 * * */2", removeDanglingTasks, { name: 'removeDanglingTasks', runOnInit: true });
}

export default init;