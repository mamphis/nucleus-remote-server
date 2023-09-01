import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { Router } from "express";
import { BadRequest, Unauthorized } from 'http-errors';
import { getToken } from '../../../lib/auth';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', async (req, res, next) => {
        const { username, password } = req.body;
        if (username && password) {
            const user = await db.user.findFirst({ where: { username }, select: { id: true, tenantId: true, username: true, password: true, permission: true, onetimePassword: true } });

            if (!user) {
                return next(Unauthorized('invalid username or password'));
            }

            if (user.onetimePassword) {
                return next(Unauthorized('pending verification'));
            }

            if (!await compare(password, user.password)) {
                return next(Unauthorized('invalid username or password'));
            }

            const { token, user: authUser } = getToken(user);

            return res.json({ token, user: authUser });
        }

        return next(BadRequest('please provide username and password.'));
    });

    return router;
}