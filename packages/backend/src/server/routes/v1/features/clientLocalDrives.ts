import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Forbidden, NotFound } from 'http-errors';
import { z } from "zod";
import { AuthResponse, ClientAuthResponse, auth, clientAuth, isFeatureEnabled } from "../../../../lib/auth";
import { $t } from "../../../../lib/locale/locale";
import { Logger } from "../../../../lib/logger";

export default function (db: PrismaClient) {
    const router = Router({ mergeParams: true });

    router.put(`/`, clientAuth(), async (req, res: ClientAuthResponse, next) => {
        if (!await isFeatureEnabled(res.locals.client, 'f-1.0.12-drive_monitor')) {
            return next(Forbidden($t(req, 'error.403.featureNotEnabled')))
        }

        const schema = z.array(z.object({
            driveLetter: z.string(),
            driveDescription: z.string(),
            driveType: z.string(),
            driveFileSystem: z.string(),
            driveSize: z.number(),
            driveFreeSpace: z.number(),
        }));

        const { clientId } = res.locals.client;
        try {
            const localDrives = schema.parse(req.body);
            const client = await db.client.findFirst({ where: { id: clientId } });
            if (!client) {
                return next(NotFound($t(req, 'error.404.noClientFound', clientId)));
            }

            for (const drive of localDrives) {
                await db.localDrive.upsert({
                    where: {
                        clientId_driveLetter: {
                            clientId,
                            driveLetter: drive.driveLetter,
                        },
                    },
                    create: {
                        clientId,
                        ...drive,
                    },
                    update: {
                        ...drive,
                    },
                });
            }

            await db.localDriveHistory.createMany({
                data: localDrives.map(app => ({ clientId: clientId, driveFreeSpace: app.driveFreeSpace, driveSize: app.driveSize, driveLetter: app.driveLetter })),
            });

            res.status(204).end();
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/:clientId', auth('read:client'), async (req, res: AuthResponse, next) => {
        if (!await isFeatureEnabled(res.locals.user, 'f-1.0.12-drive_monitor')) {
            return next(Forbidden($t(req, 'error.403.featureNotEnabled')))
        }

        try {

            const drives = await db.localDrive.findMany({
                where: {
                    clientId: req.params.clientId
                },
            });

            const history = await db.localDriveHistory.findMany({
                where: {
                    clientId: req.params.clientId
                },
            });

            return res.json({ drives, history });
        } catch (e: unknown) {
            return next(e);
        }
    });
    return router;
}