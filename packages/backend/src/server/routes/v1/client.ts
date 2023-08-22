import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { AuthResponse, auth } from "../../../lib/auth";
import { ZodError, z } from "zod";
import { UnprocessableEntity } from 'http-errors';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/clients/
router.get('/', auth('read:client'), async (req, res: AuthResponse, next) => {
    const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

    res.json(clients);
});

router.put(`/`, async (req, res, next) => {
    const schema = z.object({
        username: z.string(),
        os: z.string(),
        hostname: z.string(),
        appVersion: z.string(),
        tenantId: z.string().uuid(),
        id: z.string().uuid(),
    });

    try {
        const clientData = schema.parse(req.body);

        const client = await db.client.upsert({
            where: {
                id: clientData.id,
                tenantId: clientData.tenantId,
            },
            create: {
                ...clientData,
                lastPing: new Date(),
            },
            update: {
                ...clientData,
                lastPing: new Date(),
            }
        });

        return res.json(client);
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

router.get('/:clientId/tasks', async (req, res, next) => {
    const tasks = await db.task.findMany({
        where: {
            configuration: {
                group: {
                    some: {
                        client: {
                            some: {
                                id: req.params.clientId,
                            }
                        }
                    }
                }
            }
        }
    });

    return res.json(tasks);
});

export default router;
