import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { BadRequest, Forbidden } from 'http-errors';
import { type AuthResponse, auth, hasPermission } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";
import { ValidKeys } from "../../../lib/locale/en";

export default function (db: PrismaClient) {
    const router = Router({ mergeParams: true });

    router.get('/', auth(), async (req, res: AuthResponse, next) => {
        const { tenantId } = req.params;
        if (!tenantId || typeof tenantId !== 'string') {
            return next(BadRequest($t(req, 'error.400.invalidTenantIdFormat', tenantId)));
        }

        if (!hasPermission(res.locals.user, 'special:admin')) {
            if (tenantId !== res.locals.user.tenantId) {
                return next(Forbidden($t(req, "error.403.forbidden")))
            }
        }

        //TODO: Check if tenant is valid? or is it okay, to return an empty array if tenant does not exist?
        const features = await db.featureFlag.findMany({
            where: {
                tenantId: tenantId,
            }
        });

        return res.json(features.map(f => ({ ...f, name: $t(req, f.name as unknown as ValidKeys) })));
    });

    router.patch(`/:featureId`, auth('update:tenant'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            enabled: z.boolean().optional().default(false),
        });

        try {
            const featureData = schema.parse(req.body);

            const feature = await db.featureFlag.update({
                where: {
                    tenantId_id: {
                        id: req.params.featureId,
                        tenantId: req.params.tenantId,
                    },
                },
                data: {
                    ...featureData,
                },
            });

            return res.json(feature);
        } catch (e: unknown) {
            return next(e);
        }
    });

    return router;
}