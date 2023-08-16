import { Router } from "express";
import { auth } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { NotFound, UnprocessableEntity } from 'http-errors';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import z, { ZodError } from 'zod';
import { randomString } from "../../../lib/util";
import mailer from "../../../lib/mailer";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/clients/
router.get('/', auth('read:user'), async (req, res, next) => {
    res.json(await db.user.findMany({
        select: {
            id: true,
            username: true,
            permission: true,
            tenant: true
        }
    }));
});

router.get('/:username', auth('read:user'), async (req, res, next) => {
    const user = await db.user.findFirst({
        where: {
            OR: [
                { username: req.params.username },
                { id: req.params.username },
            ]
        },
        select: {
            id: true,
            username: true,
            permission: true,
            tenant: true
        }
    });

    if (!user) {
        return next(NotFound(`${req.params.username} was not found.`));
    }

    return res.json(user);
});

router.post('/', auth('create:user'), async (req, res, next) => {
    const schema = z.object({
        username: z.string(),
        tenant: z.string().uuid(),
        email: z.string().email(),
    });

    try {
        const userData = schema.parse(req.body);
        const onetimePassword = randomString(10);

        const user = await db.user.create({
            data: {
                tenantId: userData.tenant,
                password: '',
                username: userData.username,
                email: userData.email,
                onetimePassword: onetimePassword,
            }
        });

        mailer.sendRegistrationMail(user);
        return res.json(user);
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

router.patch('/:userId/permissions', auth('update:user'), async (req, res, next) => {
    const schema = z.object({
        permission: z.string(),
        create: z.boolean(),
        read: z.boolean(),
        update: z.boolean(),
        del: z.boolean(),
    });

    try {
        const permissionData = schema.parse(req.body);
        const updatePermission = async (allowed: boolean, scope: string) => {
            if (allowed) {
                await db.permission.update({
                    where: {
                        scope,
                    },
                    data: {
                        scope,
                        user: {
                            connect: {
                                id: req.params.userId
                            }
                        }
                    }
                });
            } else {
                await db.permission.update({
                    where: {
                        scope,
                    },
                    data: {
                        scope,
                        user: {
                            disconnect: {
                                id: req.params.userId
                            }
                        }
                    }
                });
            }
        }

        await updatePermission(permissionData.create, `create:${permissionData.permission}`);
        await updatePermission(permissionData.read, `read:${permissionData.permission}`);
        await updatePermission(permissionData.update, `update:${permissionData.permission}`);
        await updatePermission(permissionData.del, `delete:${permissionData.permission}`);

        const user = await db.user.findFirst({
            where: {
                id: req.params.userId
            },
            select: {
                id: true,
                username: true,
                permission: true,
                tenant: true
            }
        });
        return res.json(user);
    } catch (e: unknown) {
        if (e instanceof PrismaClientUnknownRequestError || e instanceof PrismaClientKnownRequestError) {
            return next(UnprocessableEntity(e.message));
        }

        if (e instanceof ZodError) {
            return next(e);
        }

        return next(e);
    }
});

export default router;