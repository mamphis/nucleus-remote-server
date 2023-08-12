import { Router } from "express";
import { auth } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { NotFound } from 'http-errors';

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

export default router;