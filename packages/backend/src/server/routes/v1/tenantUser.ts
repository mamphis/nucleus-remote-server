import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";
import { Forbidden, NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth } from "../../../lib/auth";
import mailer from "../../../lib/mailer";
import { randomString } from "../../../lib/util";

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/', auth('read:tenant-user'), async (req, res: AuthResponse, next) => {
        res.json(await db.user.findMany({
            where: {
                tenantId: res.locals.user.tenantId,
            },
            select: {
                id: true,
                username: true,
                permission: true,
                tenant: true,
                email: true,
            }
        }));
    });

    router.get('/:username', auth('read:tenant-user'), async (req, res: AuthResponse, next) => {
        const user = await db.user.findFirst({
            where: {
                OR: [
                    { username: req.params.username },
                    { id: req.params.username },
                ],
                tenantId: res.locals.user.tenantId,
            },
            select: {
                id: true,
                username: true,
                permission: true,
                tenant: true,
                email: true,
            }
        });

        if (!user) {
            return next(NotFound(`${req.params.username} was not found.`));
        }

        return res.json(user);
    });

    router.delete('/:id', auth('delete:user'), async (req, res: AuthResponse, next) => {
        await db.user.delete({
            where: {
                id: req.params.id,
                tenantId: res.locals.user.tenantId,
            }
        }).catch(() => { });;

        res.status(201).end();
    });

    router.post('/', auth('create:tenant-user'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            username: z.string(),
            email: z.string().email(),
        });

        try {
            const userData = schema.parse(req.body);
            const onetimePassword = randomString(10);

            const user = await db.user.create({
                data: {
                    tenantId: res.locals.user.tenantId,
                    password: '',
                    username: userData.username,
                    email: userData.email,
                    onetimePassword: onetimePassword,
                },
                select: {
                    id: true,
                    username: true,
                    permission: true,
                    tenant: true,
                    email: true,
                }
            });

            mailer.sendRegistrationMail(Object.assign({}, userData, { onetimePassword }));
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

    router.patch('/:userId/permissions', auth('update:tenant-user'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            permission: z.string(),
            create: z.boolean(),
            read: z.boolean(),
            update: z.boolean(),
            del: z.boolean(),
        });

        //Check if user is in the same tenant
        const user = await db.user.findFirst({ where: { id: req.params.userId } });
        if (!user) {
            return next(NotFound('User not found.'))
        }

        if (user.tenantId !== res.locals.user.tenantId) {
            return next(Forbidden('You cannot change the users permission.'));
        }

        try {
            const permissionData = schema.parse(req.body);
            if (['tenant', 'user'].includes(permissionData.permission)) {
                return next(Forbidden('You cannot change the users permission.'));
            }

            const updater = await db.user.findFirstOrThrow({
                where: {
                    username: res.locals.user.username,
                },
            });

            if (req.params.userId === updater.id) {
                return next(Forbidden('You cannot update your own permissions.'));
            }

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
                    tenant: true,
                    email: true,
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

    router.patch('/:userId', auth('update:tenant-user'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            email: z.string().email(),
        });

        try {
            const userData = schema.parse(req.body);
            const user = await db.user.update({
                where: {
                    id: req.params.userId,
                },
                data: {
                    email: userData.email,
                },
                select: {
                    id: true,
                    username: true,
                    permission: true,
                    tenant: true,
                    email: true,
                }
            });

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
    
    return router;
}