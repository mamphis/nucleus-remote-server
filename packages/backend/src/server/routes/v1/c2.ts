import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { BadRequest } from 'http-errors';
import { z } from "zod";
import { ClientAuthResponse, clientAuth } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";
import { createNotification } from "../../../lib/notification";
import clientInstalledApps from "./clientInstalledApps";

export default function (db: PrismaClient) {
    const router = Router();

    router.put(`/`, clientAuth(), async (req, res, next) => {
        const schema = z.object({
            username: z.string(),
            os: z.string(),
            hostname: z.string(),
            appVersion: z.string(),
            tenantId: z.string().uuid(),
            id: z.string().uuid(),
        });

        const { clientId, tenantId } = res.locals.client;

        try {
            const clientData = schema.parse(req.body);

            // Check if the tenant exist
            const tenant = await db.tenant.findFirst({
                where: { id: tenantId, }, select: {
                    id: true,
                }
            });
            if (!tenant) {
                return next(BadRequest($t(req, 'error.400.invalidTenant', tenantId)));
            }

            // Check if the client belongs to the same tenant if it exists.
            var existingClient = await db.client.findFirst({ where: { id: clientId } });
            if (existingClient && existingClient.tenantId != tenantId) {
                return next(BadRequest($t(req, 'error.400.invalidClient', clientId)));
            }

            // Check if the hostname is the same. Otherwise it may be a duplicate configuration
            if (existingClient) {
                if (existingClient.hostname !== clientData.hostname) {
                    await createNotification('High', 'notification.differentHostname', tenant.id, existingClient.hostname, clientData.hostname);
                }
            }

            const client = await db.client.update({
                where: {
                    id: clientId,
                    tenantId: tenantId,
                },
                data: {
                    ...clientData,
                    lastPing: new Date(),
                }
            });

            return res.json(client);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/:clientId/tasks', clientAuth(), async (req, res: ClientAuthResponse, next) => {
        const client = await db.client.findFirst({ where: { id: res.locals.client.clientId } });
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
                                    id: res.locals.client.clientId,
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
                output: true,
            }
        });

        return res.json(tasks);
    });

    router.get('/:clientId/features', clientAuth(), async (req, res: ClientAuthResponse, next) => {
        const features = await db.featureFlag.findMany({
            where: {
                tenantId: res.locals.client.tenantId,
            }
        });

        return res.json(features);
    });

    router.post('/:clientId/logs', clientAuth(), async (req, res: ClientAuthResponse, next) => {
        const schema = z.object({
            message: z.string(),
            level: z.string(),
        });

        try {
            const clientData = schema.parse(req.body);

            const clientLog = await db.clientLog.create({
                data: {
                    ...clientData,
                    clientId: res.locals.client.clientId,
                }
            });

            return res.json(clientLog);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.post('/:clientId/details', clientAuth(), async (req, res: ClientAuthResponse, next) => {
        const schema = z.record(z.string().or(z.number()));
        const { clientId } = res.locals.client;
        try {
            const clientDetailsData = schema.parse(req.body);
            for (const key in clientDetailsData) {
                if (Object.prototype.hasOwnProperty.call(clientDetailsData, key)) {
                    const value = clientDetailsData[key];
                    await db.clientDetail.upsert({
                        where: {
                            key_clientId: {
                                clientId,
                                key,
                            }
                        },
                        create: {
                            key,
                            clientId,
                            value: value.toString(),
                        },
                        update: {
                            key,
                            clientId,
                            value: value.toString(),
                        }
                    });
                }
            }

            const clientDetails = await db.clientDetail.findMany({
                where: {
                    clientId,
                },
            });

            return res.json(clientDetails);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.use('/:clientId/installedApps', clientInstalledApps(db));

    return router;
}