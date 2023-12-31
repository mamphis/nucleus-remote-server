import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { NotFound } from 'http-errors';
import z from 'zod';
import { AuthResponse, auth } from "../../../lib/auth";

const groupSelect: Prisma.GroupSelect = {
    id: true,
    name: true,
    isDefault: true,
    client: {
        select: {
            id: true,
            username: true,
            os: true,
            appVersion: true,
            hostname: true,
            lastPing: true,
            active: true,
        }
    },
    configuration: {
        select: {
            id: true,
            name: true,
        }
    },
}

export default function (db: PrismaClient) {
    const router = Router();

    router.get('/', auth('read:group'), async (req, res: AuthResponse, next) => {
        const groups = await db.group.findMany({
            where: { tenantId: res.locals.user.tenantId },
            select: groupSelect
        });
        return res.json(groups);
    });

    router.get('/:groupId', auth('read:group'), async (req, res: AuthResponse, next) => {
        const group = await db.group.findFirst({
            where: { tenantId: res.locals.user.tenantId, id: req.params.groupId },
            select: groupSelect,
        });

        if (!group) {
            return NotFound(`Group with id "${req.params.groupId}" was not found.`);
        }

        return res.json(group);
    });

    router.delete('/:id', auth('delete:group'), async (req, res: AuthResponse, next) => {
        await db.group.delete({
            where: {
                id: req.params.id,
                tenantId: res.locals.user.tenantId,
            }
        }).catch(() => { });;

        res.status(204).end();
    });

    router.post('/', auth('create:group'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            name: z.string(),
            isDefault: z.boolean(),
        });

        try {
            const groupData = schema.parse(req.body);

            const group = await db.group.create({
                data: {
                    name: groupData.name,
                    isDefault: groupData.isDefault,
                    tenantId: res.locals.user.tenantId,
                },
                select: groupSelect,
            });
            return res.json(group);
        } catch (e: unknown) {
            return next(e);
        }
    })

    router.patch('/:groupId', auth('update:group'), async (req, res: AuthResponse, next) => {
        const schema = z.object({
            name: z.string(),
            isDefault: z.boolean(),
            configuration: z.array(
                z.object({
                    id: z.string(),
                }),
            ),
            client: z.array(
                z.object({
                    id: z.string(),
                }),
            ),
        });

        try {
            const groupData = schema.parse(req.body);

            const group = await db.group.update({
                where: {
                    id: req.params.groupId,
                    tenantId: res.locals.user.tenantId,
                },
                data: {
                    name: groupData.name,
                    isDefault: groupData.isDefault,
                    configuration: {
                        set: groupData.configuration,
                    },
                    client: {
                        set: groupData.client,
                    }
                },
                select: groupSelect,
            });

            return res.json(group);
        } catch (e: unknown) {
            return next(e);
        }
    });

    return router;
}