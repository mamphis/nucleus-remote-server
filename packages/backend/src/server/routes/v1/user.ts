import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { compare, hash } from "bcrypt";
import { Router } from "express";
import { BadRequest, Forbidden, NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth, hasPermission } from "../../../lib/auth";
import { $t } from "../../../lib/locale/locale";
import mailer from "../../../lib/mailer";
import { randomString } from "../../../lib/util";

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/', auth('read:user'), async (req, res: AuthResponse, next) => {
        res.json(await db.user.findMany({
            select: {
                id: true,
                username: true,
                permission: true,
                tenant: true,
                email: true,
            }
        }));
    });

    router.get('/me', auth(), async (req, res: AuthResponse, next) => {
        const user = await db.user.findFirst({
            where: {
                id: res.locals.user.id,
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

    router.patch('/me', auth(), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            email: z.string().email(),
        });

        try {
            const userData = schema.parse(req.body);
            const user = await db.user.update({
                where: {
                    id: res.locals.user.id,
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
            return next(e);
        }
    });

    router.patch('/changePassword', auth(), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            oldPassword: z.string(),
            newPassword: z.string().min(8),
        });

        try {
            const user = await db.user.findFirst({ where: { id: res.locals.user.id } });

            if (!user) {
                return next(NotFound($t(req, 'error.403.cannotChangeUsersPermission', res.locals.user.username)));
            }

            const userData = schema.parse(req.body);
            if (!await compare(userData.oldPassword, user?.password)) {
                return next(BadRequest($t(req, 'error.400.incorrectOldPassword')));
            }

            const update = await db.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password: await hash(userData.newPassword, 10),
                },
                select: {
                    id: true,
                    username: true,
                    permission: true,
                    tenant: true,
                    email: true,
                },
            })

            return res.json(update);
        } catch (e: unknown) {
            return next(e);
        }
    });

    router.get('/:username', auth('read:user'), async (req, res: AuthResponse, next) => {
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
                tenant: true,
                email: true,
            }
        });

        if (!user) {
            return next(NotFound($t(req, 'error.404.noUserFound', req.params.username)));
        }

        return res.json(user);
    });

    router.delete('/:id', auth('delete:user'), async (req, res: AuthResponse, next) => {
        await db.user.delete({
            where: {
                id: req.params.id,
            }
        }).catch(() => { });;

        res.status(204).end();
    });

    router.post('/', auth('create:user'), async (req, res: AuthResponse, next) => {
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
            return next(e);
        }
    });

    router.patch('/:userId/permissions', auth('update:user'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            permission: z.string(),
            create: z.boolean(),
            read: z.boolean(),
            update: z.boolean(),
            del: z.boolean(),
        }).or(z.object({
            special: z.boolean(),
        }));

        try {
            const updater = await db.user.findFirstOrThrow({
                where: {
                    username: res.locals.user.username,
                },
            });

            if (req.params.userId === updater.id) {
                return next(Forbidden($t(req, 'error.403.cannotChangeUsersPermission')));
            }

            const permissionData = schema.parse(req.body);
            if ('special' in permissionData) {
                if (hasPermission(res.locals.user, 'special:admin')) {
                    const type = permissionData.special ? 'connect' : 'disconnect';

                    await db.permission.update({
                        where: {
                            scope: 'special:admin',
                        },
                        data: {
                            scope: 'special:admin',
                            user: {
                                [type]: {
                                    id: req.params.userId
                                }
                            }
                        }
                    });
                }
                return;
            }

            const updatePermission = async (allowed: boolean, scope: string) => {
                const type = allowed ? 'connect' : 'disconnect';

                await db.permission.update({
                    where: {
                        scope,
                    },
                    data: {
                        scope,
                        user: {
                            [type]: {
                                id: req.params.userId
                            }
                        }
                    }
                });
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

    router.patch('/:userId', auth('update:user'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            tenant: z.string().uuid(),
            email: z.string().email(),
        });

        try {
            const userData = schema.parse(req.body);
            const user = await db.user.update({
                where: {
                    id: req.params.userId,
                },
                data: {
                    tenantId: userData.tenant,
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
            return next(e);
        }
    });

    return router;
};