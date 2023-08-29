import { configDotenv } from 'dotenv';
configDotenv();

import { PrismaClient } from "@prisma/client";
import { Logger } from './lib/logger';
import { isProduction } from './lib/util';
import { needSeed, seed } from "./seed";
Logger.info('Production Environment:', isProduction());

import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import mailer from './lib/mailer';
import init from './lib/tasks';
import { Server } from './server/server';

const port = Number(process.env.PORT);

const start = async () => {
    try {
        const db = new PrismaClient();
        await db.$connect();
        if (await needSeed(db)) {
            Logger.info('Empty database found. Seeding database.');
            await seed(db);
        }
    } catch (e: unknown) {
        if (e instanceof PrismaClientInitializationError) {
            Logger.fatal(e.message);
            process.exit(1);
        }
    }

    await mailer.init();

    const server = new Server(port);
    server.configure();

    await server.start().catch(e => {
        if (e.code === 'EADDRINUSE') {
            Logger.fatal('Cannot start server because the port is already in use: ' + port);
            process.exit(1);
        }
    });

    init();
}

start();