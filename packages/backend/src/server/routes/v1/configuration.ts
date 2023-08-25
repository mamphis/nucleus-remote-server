import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";
import { NotFound, UnprocessableEntity } from 'http-errors';
import z, { ZodError } from 'zod';
import { AuthResponse, auth } from "../../../lib/auth";

const router = Router();
const db = new PrismaClient();

router.get('/', auth('read:configuration'), async (req, res: AuthResponse, next) => {
    const configurations = await db.configuration.findMany({
        where: { tenantId: res.locals.user.tenantId }, select: {
            id: true,
            name: true,
            group: true,
            task: true,
        }
    });
    return res.json(configurations);
});

router.get('/:configurationId', auth('read:configuration'), async (req, res: AuthResponse, next) => {
    const configuration = await db.configuration.findFirst({
        where: { tenantId: res.locals.user.tenantId, id: req.params.configurationId }, select: {
            id: true,
            name: true,
            group: true,
            task: true,
        }
    });

    if (!configuration) {
        return NotFound(`Configuration with id "${req.params.configurationId}" was not found.`);
    }

    return res.json(configuration);
});

router.delete('/:id', auth('delete:configuration'), async (req, res: AuthResponse, next) => {
    await db.configuration.delete({
        where: {
            id: req.params.id,
            tenantId: res.locals.user.tenantId,
        }
    });

    res.status(201).end();
});

router.get('/:configurationId/groups', auth('read:configuration', 'read:group'), async (req, res: AuthResponse, next) => {
    const groups = await db.group.findMany({
        where: { tenantId: res.locals.user.tenantId, configuration: { some: { id: req.params.configurationId } } }, select: {
            id: true,
            name: true,
            client: true,
            configuration: true,
        }
    });
    return res.json(groups);
});

router.post('/', auth('create:configuration'), async (req, res: AuthResponse, next) => {
    const schema = z.object({
        name: z.string(),
    });

    try {
        const configurationData = schema.parse(req.body);

        const configuration = await db.configuration.create({
            data: {
                name: configurationData.name,
                tenantId: res.locals.user.tenantId,
            }
        });
        return res.json(configuration);
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

router.patch('/:configurationId', auth('update:configuration'), async (req, res: AuthResponse, next) => {
    const schema = z.object({
        name: z.string(),
        group: z.array(
            z.object({
                id: z.string(),
            }),
        ),
        task: z.array(
            z.object({
                id: z.string(),
            }),
        ),
    });

    try {
        const configurationData = schema.parse(req.body);

        const configuration = await db.configuration.update({
            where: {
                id: req.params.configurationId,
                tenantId: res.locals.user.tenantId,
            },
            data: {
                name: configurationData.name,
                group: {
                    set: configurationData.group
                },
                task: {
                    set: configurationData.task,
                }
            }
        });

        return res.json(configuration);
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