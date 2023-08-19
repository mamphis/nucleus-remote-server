import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";
import { NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth } from "../../../lib/auth";

const router = Router();
const db = new PrismaClient();

router.get('/', auth('read:group'), async (req, res: AuthResponse, next) => {
    const groups = await db.group.findMany({
        where: { tenantId: res.locals.user.tenantId }, select: {
            id: true,
            name: true,
            client: true,
            configuration: true,
        }
    });
    return res.json(groups);
});

router.get('/:groupId', auth('read:group'), async (req, res: AuthResponse, next) => {
    const group =  await db.group.findFirst({
        where: { tenantId: res.locals.user.tenantId, id: req.params.groupId }, select: {
            id: true,
            name: true,
            client: true,
            configuration: true,
        }
    });

    if (!group) {
        return NotFound(`Group with id "${req.params.groupId}" was not found.`);
    }

    return res.json(group);
});

router.post('/', auth('create:group'), async (req, res: AuthResponse, next) => {
    const schema = z.object({
        name: z.string(),
    });

    try {
        const groupData = schema.parse(req.body);

        const group = await db.group.create({
            data: {
                name: groupData.name,
                tenantId: res.locals.user.tenantId,
            }
        });
        return res.json(group);
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

router.patch('/:groupId', auth('update:group'), async (req, res: AuthResponse, next) => {
    const schema = z.object({
        name: z.string(),
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
            }
        });

        return res.json(group);
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