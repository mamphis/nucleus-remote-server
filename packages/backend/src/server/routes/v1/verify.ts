import { BadRequest, Unauthorized } from 'http-errors';
import { Router } from "express";
import { compare, hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { getToken } from '../../../lib/auth';

const router = Router();
const db = new PrismaClient();

router.post('/', async (req, res, next) => {
    console.log(req.body)
    const { onetimePassword, password } = req.body;
    if (onetimePassword && password) {
        const user = await db.user.findFirst({ where: { onetimePassword }, select: { tenantId: true, username: true, password: true, permission: true } });

        if (!user) {
            return next(Unauthorized('invalid username or password'));
        }

        await db.user.update({ where: { username: user.username }, data: { password: await hash(password, 10), onetimePassword: '' } })

        const { token, user: authUser } = getToken(user);

        return res.json({ token, user: authUser });
    }

    return next(BadRequest('please provide username and password.'));
});

export default router;