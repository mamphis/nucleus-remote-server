import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Forbidden, NotFound } from 'http-errors';
import { z } from "zod";
import { AuthResponse, ClientAuthResponse, auth, clientAuth, isFeatureEnabled } from "../../../../lib/auth";
import { $t } from "../../../../lib/locale/locale";

export default function (db: PrismaClient) {
    const router = Router({ mergeParams: true });

    router.put(`/`, clientAuth(), async (req, res: ClientAuthResponse, next) => {
        if (!await isFeatureEnabled(res.locals.client, 'f-1.0.8-installed_apps')) {
            return next(Forbidden($t(req, 'error.403.featureNotEnabled')))
        }

        const schema = z.array(z.object({
            name: z.string(),
            version: z.string(),
            registryKey: z.string(),
            publisher: z.string(),
            installDate: z.coerce.date(),
        }));

        const { clientId } = res.locals.client;
        try {
            const installedApps = schema.parse(req.body);
            const client = await db.client.findFirst({ where: { id: clientId } });
            if (!client) {
                return next(NotFound($t(req, 'error.404.noClientFound', clientId)));
            }
            // Delete all uninstalled apps
            await db.installedApps.deleteMany({
                where: {
                    clientId,
                    name: {
                        notIn: installedApps.map((app) => app.name),
                    }
                }
            });

            // Add all installed apps
            await db.installedApps.createMany({
                skipDuplicates: true,
                data: installedApps.map((app) => {
                    return {
                        clientId,
                        name: app.name,
                        version: app.version,
                        registryKey: app.registryKey,
                        publisher: app.publisher,
                        installDate: app.installDate,
                    }
                })
            });

            res.status(204).end();
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