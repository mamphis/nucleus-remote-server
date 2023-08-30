import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";
import { ZodError, z } from "zod";
import { UnprocessableEntity, BadRequest } from 'http-errors';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";

export default function (db: PrismaClient) {
    const router = Router();

    // GET localhost:8080/api/v1/clients/
    router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
        const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

        res.json(clients);
    });

    router.get('/configuration/:tenantId', async (req, res, next) => {
        res.attachment('appsettings.json');
        res.type('application/json');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        res.send(JSON.stringify({
            "Logging": {
                "LogLevel": {
                    "Default": "Information",
                    "Microsoft.Hosting.Lifetime": "Information"
                }
            },
            "HostSettings": {
                "BaseUrl": `${req.header('x-forwarded-proto') ?? req.protocol}://${req.get('host')}/api/v1/`,
                "Id": randomUUID(),
                "TenantId": req.params.tenantId,
            }
        }, undefined, 4));
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
        }).catch(() => { });

        res.status(204).end();
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

            // Check if the tenant exist
            const tenant = await db.tenant.findFirst({
                where: { id: clientData.tenantId, }, select: {
                    _count: {
                        select: {
                            // Only get active Clients
                            client: {
                                where: {
                                    active: true
                                }
                            }
                        }
                    },
                    maxClients: true,
                }
            });
            if (!tenant) {
                return next(BadRequest('Invalid Tenant: ' + clientData.tenantId));
            }

            // Check if the client belongs to the same tenant if it exists.
            var existingClient = await db.client.findFirst({ where: { id: clientData.id } });
            if (existingClient && existingClient.tenantId != clientData.tenantId) {
                return next(BadRequest('Invalid client id: ' + clientData.id));
            }

            let active = false;

            if (!existingClient) {
                // New Client wants to be registered to a tenant. Check if it shell be active
                if (tenant.maxClients > tenant._count.client) {
                    active = true;
                }
            }

            const client = await db.client.upsert({
                where: {
                    id: clientData.id,
                    tenantId: clientData.tenantId,
                },
                create: {
                    ...clientData,
                    lastPing: new Date(),
                    active,
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
        const client = await db.client.findFirst({ where: { id: req.params.clientId } });
        if (client && !client.active) {
            // If the client is not active. Simply ignore the tasks it should execute otherwise
            return res.json([]);
        }

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
                },
                active: true,
            },
            select: {
                configuration: true,
                id: true,
                active: true,
                runOnce: true,
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
            level: z.string(),
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

    return router;
}