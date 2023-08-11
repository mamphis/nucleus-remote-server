import { BadRequest, Unauthorized } from 'http-errors';
import { Router } from "express";
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { getToken } from '../../../lib/auth';

const router = Router();
const db = new PrismaClient();

router.post('/', async (req, res, next) => {
    const { username, password } = req.body;
    if (username && password) {
        const user = await db.user.findFirst({ where: { username }, select: { tenantId: true, username: true, password: true, permission: true } });

        if (!user) {
            return next(Unauthorized('invalid username or password'));
        }

        if (!await compare(password, user.password)) {
            return next(Unauthorized('invalid username or password'));
        }

        const token = getToken(user);
        return res.json({ token });
    }

    return next(BadRequest('please provide username and password.'));
});

export default router;