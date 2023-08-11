import { configDotenv } from 'dotenv';
configDotenv();

import { PrismaClient } from "@prisma/client";
import { needSeed, seed } from "./seed";
import { Server } from './server/server';

const port = Number(process.env.PORT);

const start = async () => {
    const db = new PrismaClient();
 
    if (await needSeed(db)) {
        await seed(db)
    }

    const server = new Server(port);
    server.configure();
    server.start();
}

start();