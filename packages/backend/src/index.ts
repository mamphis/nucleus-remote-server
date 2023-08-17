import { configDotenv } from 'dotenv';
configDotenv();

import { PrismaClient } from "@prisma/client";
import { Logger } from './lib/logger';
import { isProduction } from './lib/util';
import { needSeed, seed } from "./seed";
Logger.info('Production Environment:', isProduction());

import mailer from './lib/mailer';
import { Server } from './server/server';

const port = Number(process.env.PORT);



const start = async () => {
    const db = new PrismaClient();

    if (await needSeed(db)) {
        Logger.info('Empty database found. Seeding database.');
        await seed(db);
    }

    await mailer.init();

    const server = new Server(port);
    server.configure();
    server.start();
}

start();