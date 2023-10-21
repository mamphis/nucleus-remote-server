import { configDotenv } from 'dotenv';
configDotenv();

import { Logger } from './lib/logger';
import { isProduction } from './lib/util';
import { needSeed, seed, seedAdmin, seedFeatureFlags } from "./seed";
Logger.info('Production Environment:', isProduction());

import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import deTranslations from 'zod-i18n-map/locales/de/zod.json';
import db from './lib/db';
import mailer from './lib/mailer';
import initTasks from './lib/tasks';
import { Server } from './server/server';

const port = Number(process.env.PORT);

const start = async () => {
    const timer = Logger.timer('server-start')
    try {
        timer.log('PrismaClient initialized');
        await db.$connect();
        timer.log('Database connected');
        if (await needSeed(db)) {
            Logger.info('Empty database found. Seeding database.');
            await seed(db);
        }

        db.tenant.findMany().then(tenants => {
            tenants.forEach(t => {
                seedFeatureFlags(db, t);
            });
        });

        timer.log('Database seeded');
        db.user.findFirstOrThrow({ where: { permission: { some: { scope: 'special:admin' } } } }).then(admin => {
            seedAdmin(db, admin);
        });
        timer.log('Admin seeded');
    } catch (e: unknown) {
        if (e instanceof PrismaClientInitializationError) {
            Logger.fatal(e.message);
            process.exit(1);
        }
    }

    timer.log('Database ready');
    mailer.init();
    timer.log('Mailer ready');
    const server = new Server(port);
    server.configure();
    timer.log('Server configured');
    i18next.init({
        lng: 'de',
        resources: {
            de: { zod: deTranslations },
        },
    });
    z.setErrorMap(zodI18nMap);
    timer.log('i18n ready');
    await server.start().catch(e => {
        if (e.code === 'EADDRINUSE') {
            Logger.fatal('Cannot start server because the port is already in use: ' + port);
            process.exit(1);
        }
    });
    timer.log('Server started');

    initTasks();
    timer.log('Tasks initialized');
    timer.stop();
}

start();

