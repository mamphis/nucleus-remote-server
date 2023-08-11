import { NotFound, HttpError, InternalServerError } from 'http-errors';
import express, { Application, NextFunction, Request, Response, json } from "express";
import api from './routes';

export class Server {
    private app: Application;
    constructor(private readonly port: number) {
        this.app = express();
    }

    configure() {
        this.app.use(json());

        this.app.use('/api', api);

        this.app.use((req, _res, next) => {
            next(NotFound(`${req.originalUrl} cannot be found.`));
        });

        this.app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof HttpError) {
                return res.status(err.status).json({ error: err.name, message: err.message });
            }

            const internalServerError = InternalServerError();
            return res.status(500).json({ error: internalServerError.status, message: internalServerError.message });
        })
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server started listening on port ${this.port}`);
        });
    }
}