import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";
import { Router } from "express";
import { BadRequest, Forbidden, UnprocessableEntity } from 'http-errors';
import { ZodError, z } from "zod";
import { AuthResponse, auth } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";

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
                    id: true,
                    maxClients: true,
                }
            });
            if (!tenant) {
                return next(BadRequest($t(req, 'error.400.invalidTenant', clientData.tenantId)));
            }

            // Check if the client belongs to the same tenant if it exists.
            var existingClient = await db.client.findFirst({ where: { id: clientData.id } });
            if (existingClient && existingClient.tenantId != clientData.tenantId) {
                return next(BadRequest($t(req, 'error.400.invalidClient', clientData.id)));
            }

            let active = false;
            let groups: Array<{ id: string }> = [];

            if (!existingClient) {
                // New Client wants to be registered to a tenant. Check if it shell be active
                if (tenant.maxClients > tenant._count.client) {
                    active = true;
                }

                groups = await db.group.findMany({
                    where: {
                        tenantId: tenant.id,
                        isDefault: true,
                    },
                    select: {
                        id: true
                    },
                });
            }

            const client = await db.client.upsert({
                where: {
                    id: clientData.id,
                    tenantId: clientData.tenantId,
                },
                create: {
                    ...clientData,
                    group: {
                        connect: groups
                    },
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
            return next(e);
        }
    });

    router.patch(`/:clientId`, auth('update:client'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            active: z.boolean()
        });

        try {
            const clientData = schema.parse(req.body);
            const tenant = await db.tenant.findFirstOrThrow({
                where: { id: res.locals.user.tenantId, }, select: {
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

            // New Client wants to be registered to a tenant. Check if it shell be active
            if (tenant.maxClients <= tenant._count.client) {
                return next(Forbidden($t(req, 'error.403.maxClientsPerTenant')))
            }

            const client = await db.client.update({
                where: {
                    tenantId: res.locals.user.tenantId,
                    id: req.params.clientId,
                },
                data: {
                    ...clientData,
                }
            });

            return res.json(client);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/:clientId/tasks', async (req, res, next) => {
        const client = await db.client.findFirst({ where: { id: req.params.clientId } });
        const design = req.query.design === 'true';
        if (client && !client.active && !design) {
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
                active: design ? undefined : true,
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
            return next(e);
        }
    });

    router.post('/:clientId/details', async (req, res, next) => {
        const schema = z.record(z.string().or(z.number()));

        try {
            const clientDetailsData = schema.parse(req.body);
            for (const key in clientDetailsData) {
                if (Object.prototype.hasOwnProperty.call(clientDetailsData, key)) {
                    const value = clientDetailsData[key];
                    await db.clientDetail.upsert({
                        where: {
                            key_clientId: {
                                clientId: req.params.clientId,
                                key,
                            }
                        },
                        create: {
                            key,
                            clientId: req.params.clientId,
                            value: value.toString(),
                        },
                        update: {
                            key,
                            clientId: req.params.clientId,
                            value: value.toString(),
                        }
                    });
                }
            }

            const clientDetails = await db.clientDetail.findMany({
                where: {
                    clientId: req.params.clientId
                },
            });

            return res.json(clientDetails);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/:clientId/details', auth('read:client'), async (req, res, next) => {
        try {
            const clientDetails = await db.clientDetail.findMany({
                where: {
                    clientId: req.params.clientId
                },
            });

            return res.json(clientDetails);
        } catch (e: unknown) {
            return next(e);
        }
    });

    return router;
}