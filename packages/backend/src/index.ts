import { configDotenv } from 'dotenv';
configDotenv();

import { PrismaClient } from "@prisma/client";
import { isProduction } from './lib/util';
import { needSeed, seed } from "./seed";
import { Logger } from './lib/logger';
Logger.info('Production Environment:', isProduction());

import { Server } from './server/server';
import mailer from './lib/mailer';

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