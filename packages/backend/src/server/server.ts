import cors from 'cors';
import express, { Application, NextFunction, Request, Response, json } from "express";
import { Server as HttpServer } from 'http';
import { HttpError, InternalServerError, NotFound } from 'http-errors';
import { ZodError } from 'zod';
import { Logger } from '../lib/logger';
import api from './routes';
import system from './routes/system';

import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { handlePrismaClientKnownRequestError } from '../lib/locale/prismaError';

export class Server {
    private app: Application;
    private server?: HttpServer;

    constructor(private readonly port: number) {
        this.app = express();
    }

    @Logger.enter()
    configure() {
        this.app.use(cors({ origin: "*" }))
        this.app.use(json({ limit: '5Mb' }));

        this.app.use((_req, res, next) => {
            res.set('Cache-Control', 'no-store');
            next();
        });

        this.app.use((req, res, next) => {
            const start = new Date().getTime();
            next();
            res.on('finish', () => {
                Logger.debug(`Request from ${req.socket.remoteAddress} to ${req.method} ${req.originalUrl} => ${res.statusCode}`, `${new Date().getTime() - start}ms`);
            });

        });

        this.app.use('/api', api);
        this.app.use('/system', system);

        this.app.use((req, _res, next) => {
            next(NotFound(`${req.originalUrl} cannot be found.`));
        });

        this.app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
            try {
                Logger.warn(`Failed Request from ${req.socket.remoteAddress} to ${req.method} ${req.originalUrl}`, JSON.stringify(err), (err as any)?.message);
            } finally { }

            if (err instanceof HttpError) {
                return res.status(err.status).json({ type: 'HttpError', error: err.name, message: err.message });
            }

            if (err instanceof ZodError) {
                return res.status(400).json({
                    type: 'ValidationError', error: err.name, data: err.issues.map(i => ({
                        ...i,
                        path: i.path.join('.'),
                    })), message: err.message
                });
            }

            if (err instanceof PrismaClientValidationError) {
                return res.status(400).json({ type: 'ValidationError', error: err.name, message: `Invalid database operation.` });
            }

            if (err instanceof PrismaClientKnownRequestError) {
                const prismaError = handlePrismaClientKnownRequestError(req, err);
                return res.status(prismaError.status).json({
                    type: prismaError.type, code: err.code, error: prismaError.name, message: prismaError.message, data: [
                        {
                            message: prismaError.message,
                            path: prismaError.path
                        }
                    ]
                });
            }

            const internalServerError = InternalServerError();
            return res.status(500).json({ type: 'UnknownError', error: internalServerError.status, message: (err as any)?.message ?? internalServerError.message });
        });
    }

    @Logger.enter()
    async start() {
        return new Promise<void>(res => {
            this.server = this.app.listen(this.port, () => {
                Logger.info(`Server started listening on port ${this.port}`);
                res();
            });
        });
    }

    @Logger.enter()
    async stop() {
        return new Promise<void>((res, rej) => {
            this.server?.closeAllConnections();
            this.server?.close((err) => {
                if (err) {
                    return rej(err);
                }

                res();
            });
        });
    }
}