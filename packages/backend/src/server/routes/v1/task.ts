import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";
import { ZodError, z } from "zod";
import { NotFound, UnprocessableEntity } from 'http-errors';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/clients/
router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
    const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

    res.json(clients);
});

router.get('/:taskId', auth('read:task'), async (req, res, next) => {
    const task = await db.task.findFirst({
        where: {
            id: req.params.taskId,
            tenantId: res.locals.user.tenantId,
        }
    });

    if (!task) {
        return next(NotFound('task was not found'));
    }

    return res.json(task);
});

router.post(`/`, auth('create:task'), async (req, res, next) => {
    const schema = z.object({
        name: z.string(),
        type: z.string(),
        configurationId: z.string().uuid(),
    });

    try {
        const taskData = schema.parse(req.body);

        const task = await db.task.create({
            data: {
                ...taskData,
                tenantId: res.locals.user.tenantId,
                content: '',
            },
        });

        return res.json(task);
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

router.patch(`/:taskId`, auth('update:task'), async (req, res, next) => {
    const schema = z.object({
        name: z.string(),
        content: z.string(),
        active: z.boolean().optional().default(false),
        runOnce: z.boolean().optional().default(false),
    });

    try {
        const taskData = schema.parse(req.body);

        const task = await db.task.update({
            where: {
                id: req.params.taskId,
            },
            data: {
                ...taskData,
            },
        });

        return res.json(task);
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

export default router;
