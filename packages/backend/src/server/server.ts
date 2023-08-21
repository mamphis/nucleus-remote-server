import cors from 'cors';
import express, { Application, NextFunction, Request, Response, json } from "express";
import { HttpError, InternalServerError, NotFound } from 'http-errors';
import { ZodError } from 'zod';
import { Logger } from '../lib/logger';
import api from './routes';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

export class Server {
    private app: Application;
    constructor(private readonly port: number) {
        this.app = express();
    }

    @Logger.enter()
    configure() {
        this.app.use(cors({ origin: "*" }))
        this.app.use(json());

        this.app.use('/api', api);

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
                return res.status(400).json({ type: 'ValidationError', error: err.name, data: err.errors, message: err.message });
            }

            if (err instanceof PrismaClientValidationError) {
                return res.status(400).json({ type: 'ValidationError', error: err.name, message: `Invalid database operation.` });
            }   
        
            const internalServerError = InternalServerError();
            return res.status(500).json({ type: 'UnknownError', error: internalServerError.status, message: (err as any)?.message ?? internalServerError.message });
        })
    }

    @Logger.enter()
    async start() {
        return new Promise<void>(res => {
            this.app.listen(this.port, () => {
                Logger.info(`Server started listening on port ${this.port}`);
                res();
            });
        });
    }
}