import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";
import { NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth, hasPermission } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";

const tenantSelect: Prisma.TenantSelect = {
    id: true,
    name: true,
    maxClients: true,
    user: {
        select: {
            username: true,
            id: true,
        }
    },
    client: {
        select: {
            id: true,
            active: true,
        }
    }
}

export default function (db: PrismaClient) {
    const router = Router();

    // GET localhost:8080/api/v1/tenants/
    router.get('/', auth('read:tenant'), async (req, res: AuthResponse, next) => {
        if (res.locals.user.permissions.includes('special:admin')) {
            const tenants = await db.tenant.findMany({
                select: tenantSelect
            });

            return res.json(tenants);
        }

        const tenants = await db.tenant.findMany({
            where: { user: { some: { username: res.locals.user.username } } }, select: tenantSelect
        });
        return res.json(tenants);
    });

    router.get('/:tenantId', auth(), async (req, res: AuthResponse, next) => {
        if (res.locals.user.permissions.includes('special:admin')) {
            const tenants = await db.tenant.findFirst({
                where: {
                    id: req.params.tenantId,
                },
                select: tenantSelect
            });
            return res.json(tenants);
        }

        const tenant = await db.tenant.findFirst({
            where: { user: { some: { username: res.locals.user.username } }, id: req.params.tenantId }, select: tenantSelect
        });

        if (!tenant) {
            return NotFound($t(req, 'error.404.noTenantFound', req.params.tenantId));
        }

        if (hasPermission(res.locals.user, 'read:tenant')) {
            return res.json(tenant);
        } else {
            return res.json({
                maxClients: tenant.maxClients,
            });
        }

    });

    router.delete('/:id', auth('delete:tenant'), async (req, res: AuthResponse, next) => {
        await db.tenant.delete({
            where: {
                id: req.params.id,
            }
        }).catch(() => { });;

        res.status(204).end();
    });

    router.post('/', auth('create:tenant'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            name: z.string().trim().nonempty(),
            maxClients: z.number().positive(),
        });

        try {
            const tenantData = schema.parse(req.body);

            const tenant = await db.tenant.create({
                data: {
                    name: tenantData.name,
                    maxClients: tenantData.maxClients,
                }
            });
            return res.json(tenant);
        } catch (e: unknown) {
            if (e instanceof PrismaClientKnownRequestError) {
                return next(UnprocessableEntity(e.message));
            }

            if (e instanceof ZodError) {
                return next(e);
            }

            return next(e);
        }
    })

    router.patch('/:tenantId', auth('update:tenant'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            name: z.string().trim().nonempty(),
            maxClients: z.number().positive(),
        });

        try {
            const tenantData = schema.parse(req.body);

            const tenant = await db.tenant.update({
                where: {
                    id: req.params.tenantId,
                },
                data: {
                    ...tenantData
                }
            });

            // TODO: deactivate clients that exceed the maxClients limit

            return res.json(tenant);
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