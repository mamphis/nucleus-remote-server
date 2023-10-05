import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";
import { Router } from "express";
import { BadRequest, Forbidden, UnprocessableEntity, NotFound } from 'http-errors';
import { ZodError, z } from "zod";
import { AuthResponse, auth, isFeatureEnabled } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";
import { createNotification } from "../../../lib/notification";

export default function (db: PrismaClient) {
    const router = Router({ mergeParams: true });

    router.put(`/`, async (req, res, next) => {
        const schema = z.array(z.object({
            name: z.string(),
            version: z.string(),
            registryKey: z.string(),
            publisher: z.string(),
            installDate: z.coerce.date(),
        }));

        const { clientId } = req.params as any;
        try {
            const installedApps = schema.parse(req.body);
            const client = await db.client.findFirst({ where: { id: clientId } });
            if (!client) {
                return next(NotFound($t(req, 'error.404.noClientFound', clientId)));
            }

            for (const app of installedApps) {
                await db.installedApps.upsert({
                    where: {
                        clientId_name: {
                            clientId,
                            name: app.name,
                        },
                    },
                    create: {
                        ...app,
                        clientId,
                    },
                    update: {
                        ...app,
                    },
                });
            }

            res.end();
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
        if (!await isFeatureEnabled(res.locals.user, 'f-1.0.8-installed_apps')) {
            return next(Forbidden($t(req, 'error.403.featureNotEnabled')))
        }

        try {

            const apps = await db.installedApps.findMany({
                where: {
                    clientId: req.params.clientId
                },
            });

            return res.json(apps);
        } catch (e: unknown) {
            return next(e);
        }
    });
    return router;
}