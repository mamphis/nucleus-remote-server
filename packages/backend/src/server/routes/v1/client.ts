import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";
import { ZodError, z } from "zod";
import { UnprocessableEntity } from 'http-errors';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/clients/
router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
    const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

    res.json(clients);
});

router.get('/:clientId', auth('read:client'), async (req, res: AuthResponse, next) => {
    const clients = await db.client.findFirst({ where: { id: req.params.clientId, tenantId: res.locals.user.tenantId } });

    res.json(clients);
});

router.delete('/:id', auth('delete:client'), async (req, res: AuthResponse, next) => {
    await db.client.delete({
        where: {
            id: req.params.id,
            tenantId: res.locals.user.tenantId,
        }
    });

    res.status(201).end();
});

router.put(`/`, async (req, res, next) => {
    const schema = z.object({
        username: z.string(),
        os: z.string(),
        hostname: z.string(),
        appVersion: z.string(),
        tenantId: z.string().uuid(),
        id: z.string().uuid(),
    });

    try {
        const clientData = schema.parse(req.body);

        const client = await db.client.upsert({
            where: {
                id: clientData.id,
                tenantId: clientData.tenantId,
            },
            create: {
                ...clientData,
                lastPing: new Date(),
            },
            update: {
                ...clientData,
                lastPing: new Date(),
            }
        });

        return res.json(client);
    } catch (e: unknown) {
        if (e instanceof PrismaClientKnownRequestError) {
            return next(UnprocessableEntity(e.message));
        }

        if (e instanceof ZodError) {
            return next(e);
        }

        return next(e);
    }
});

router.get('/:clientId/tasks', async (req, res, next) => {
    const tasks = await db.task.findMany({
        where: {
            configuration: {
                group: {
                    some: {
                        client: {
                            some: {
                                id: req.params.clientId,
                            }
                        }
                    }
                }
            }
        },
        select: {
            configuration: true,
            id: true,
            name: true,
            type: true,
            content: true,
        }
    });

    return res.json(tasks);
});

router.post('/:clientId/logs', async (req, res, next) => {
    const schema = z.object({
        message: z.string(),
    });

    try {
        const clientData = schema.parse(req.body);

        const clientLog = await db.clientLog.create({
            data: {
                ...clientData,
                clientId: req.params.clientId
            }
        });

        return res.json(clientLog);
    } catch (e: unknown) {
        if (e instanceof PrismaClientKnownRequestError) {
            return next(UnprocessableEntity(e.message));
        }

        if (e instanceof ZodError) {
            return next(e);
        }

        return next(e);
    }
});

router.get('/:clientId/logs', auth('read:client'), async (req, res, next) => {
    try {
        const clientLog = await db.clientLog.findMany({
            where: {
                clientId: req.params.clientId
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 20
        });

        return res.json(clientLog);
    } catch (e: unknown) {
        if (e instanceof PrismaClientKnownRequestError) {
            return next(UnprocessableEntity(e.message));
        }

        if (e instanceof ZodError) {
            return next(e);
        }

        return next(e);
    }
});

export default router;
