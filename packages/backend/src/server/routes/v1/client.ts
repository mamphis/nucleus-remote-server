import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { Router } from "express";
import { Forbidden } from 'http-errors';
import { z } from "zod";
import { AuthResponse, auth } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";
import { getKeyPair } from "../../../lib/util";
import clientInstalledApps from "./clientInstalledApps";

export default function (db: PrismaClient) {
    const router = Router();

    // GET localhost:8080/api/v1/clients/
    router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
        const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

        res.json(clients);
    });

    router.get('/configuration', auth('create:client'), async (req, res: AuthResponse, next) => {
        const { privateKey, publicKey } = await getKeyPair();
        const [key, client] = await db.$transaction(async (tx) => {
            // Save public key in database
            const key = await tx.key.create({
                data: {
                    publicKey,
                }
            });

            const tenant = await tx.tenant.findFirstOrThrow({
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
                    id: true,
                    maxClients: true,
                }
            });

            const groups = await tx.group.findMany({
                where: {
                    tenantId: res.locals.user.tenantId,
                    isDefault: true,
                },
                select: {
                    id: true
                },
            });

            let active = tenant._count.client < tenant.maxClients;

            const id = randomUUID();
            const client = await tx.client.create({
                data: {
                    appVersion: '',
                    hostname: '',
                    id,
                    os: '',
                    username: '',
                    tenantId: res.locals.user.tenantId,
                    active,
                    lastPing: new Date(0),
                    keyId: key.id,
                    group: {
                        connect: groups
                    }
                }
            });

            return [key, client];
        });

        res.send(JSON.stringify({
            "Logging": {
                "LogLevel": {
                    "Default": "Information",
                    "Microsoft.Hosting.Lifetime": "Information"
                }
            },
            "HostSettings": {
                "BaseUrl": `${req.header('x-forwarded-proto') ?? req.protocol}://${req.get('host')}/api/v1/`,
                "Id": client.id,
                "TenantId": res.locals.user.tenantId,
                "KeyId": key.id,
                "PrivateKey": privateKey,
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

    router.get('/:clientId/logs', auth('read:client'), async (req, res, next) => {
        try {
            const clientLog = await db.clientLog.findMany({
                where: {
                    clientId: req.params.clientId
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 50
            });

            return res.json(clientLog);
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

    router.get('/:clientId/tasks', auth('read:client'), async (req, res: AuthResponse, next) => {
        const client = await db.client.findFirst({ where: { id: req.params.clientId } });

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
            },
            select: {
                configuration: true,
                id: true,
                active: true,
                runOnce: true,
                name: true,
                type: true,
                content: true,
                output: true,
            }
        });

        return res.json(tasks);
    });

    router.use('/:clientId/installedApps', clientInstalledApps(db));

    return router;
}