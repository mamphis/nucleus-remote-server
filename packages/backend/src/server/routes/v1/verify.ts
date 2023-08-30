import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Router } from "express";
import { BadRequest, Unauthorized } from 'http-errors';
import { getToken } from '../../../lib/auth';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', async (req, res, next) => {
        const { onetimePassword, password } = req.body;
        if (onetimePassword && password) {
            const user = await db.user.findFirst({ where: { onetimePassword }, select: { id: true, tenantId: true, username: true, password: true, permission: true } });

            if (!user) {
                return next(Unauthorized('invalid username or password'));
            }

            await db.user.update({ where: { username: user.username }, data: { password: await hash(password, 10), onetimePassword: '' } })

            const { token, user: authUser } = getToken(user);

            return res.json({ token, user: authUser });
        }

        return next(BadRequest('please provide username and password.'));
    });

    return router;
}