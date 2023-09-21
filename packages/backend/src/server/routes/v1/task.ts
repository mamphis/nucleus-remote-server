import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";
import { ZodError, z } from "zod";
import { NotFound, UnprocessableEntity } from 'http-errors';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { $t } from "../../../lib/locale/locale";

export default function (db: PrismaClient) {
    const router = Router();

    // GET localhost:8080/api/v1/clients/
    router.get('/', auth('read:task'), async (req, res: AuthResponse, next) => {
        const tasks = await db.task.findMany({ where: { tenantId: res.locals.user.tenantId } });

        res.json(tasks);
    });

    router.get('/:taskId', auth('read:task'), async (req, res, next) => {
        const task = await db.task.findFirst({
            where: {
                id: req.params.taskId,
                tenantId: res.locals.user.tenantId,
            }
        });

        if (!task) {
            return next(NotFound($t(req, 'error.404.noTaskFound', req.params.taskId)));
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
            return next(e);
        }
    });

    return router;
}