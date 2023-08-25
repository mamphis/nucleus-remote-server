import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";
import { NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth } from "../../../lib/auth";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/tenants/
router.get('/', auth('read:tenant'), async (req, res: AuthResponse, next) => {
    if (res.locals.user.permissions.includes('special:admin')) {
        const tenants = await db.tenant.findMany({
            select: {
                id: true,
                name: true,
                user: {
                    select: {
                        username: true,
                        id: true,
                    }
                }
            }
        });
        return res.json(tenants);
    }

    const tenants = await db.tenant.findMany({
        where: { user: { some: { username: res.locals.user.username } } }, select: {
            id: true,
            name: true,
            user: {
                select: {
                    username: true,
                    id: true,
                }
            }
        }
    });
    return res.json(tenants);
});

router.get('/:tenantId', auth('read:tenant'), async (req, res: AuthResponse, next) => {
    if (res.locals.user.permissions.includes('special:admin')) {
        const tenants = await db.tenant.findFirst({
            where:{
                id: req.params.tenantId,
            },
            select: {
                id: true,
                name: true,
                user: {
                    select: {
                        username: true,
                        id: true,
                    }
                }
            }
        });
        return res.json(tenants);
    }
    
    const tenant = await db.tenant.findFirst({
        where: { user: { some: { username: res.locals.user.username } }, id: req.params.tenantId }, select: {
            id: true,
            name: true,
            user: {
                select: {
                    username: true,
                    id: true,
                }
            }
        }
    });

    if (!tenant) {
        return NotFound(`Tenant with id "${req.params.tenantId}" was not found.`);
    }

    return res.json(tenant);
});

router.delete('/:id', auth('delete:tenant'), async (req, res: AuthResponse, next) => {
    await db.tenant.delete({
        where: {
            id: req.params.id,
        }
    });

    res.status(201).end();
});

router.post('/', auth('create:tenant'), async (req, res: AuthResponse, next) => {
    const schema = z.object({
        name: z.string(),
    });

    try {
        const tenantData = schema.parse(req.body);

        const tenant = await db.tenant.create({
            data: {
                name: tenantData.name,
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
        name: z.string(),
    });

    try {
        const tenantData = schema.parse(req.body);

        const tenant = await db.tenant.update({
            where: {
                id: req.params.tenantId,
            },
            data: {
                name: tenantData.name,
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

export default router;