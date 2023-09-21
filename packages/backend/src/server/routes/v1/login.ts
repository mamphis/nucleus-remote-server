import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { Router } from "express";
import { BadRequest, Unauthorized } from 'http-errors';
import { getRefreshToken, getToken } from '../../../lib/auth';
import { $t } from '../../../lib/locale/locale';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', async (req, res, next) => {
        const { username, password } = req.body;
        if (username && password) {
            const user = await db.user.findFirst({ where: { username }, select: { id: true, tenantId: true, username: true, password: true, permission: true, onetimePassword: true } });

            if (!user) {
                return next(Unauthorized($t(req, 'error.401.invalidUsernamePassword')));
            }

            if (user.onetimePassword) {
                return next(Unauthorized($t(req, 'error.401.pendingVerification')));
            }

            if (!await compare(password, user.password)) {
                return next(Unauthorized($t(req, 'error.401.invalidUsernamePassword')));
            }

            const { token, user: authUser } = getToken(user);
            const refreshToken = getRefreshToken(user);
            return res.json({ token, user: authUser, refreshToken });
        }

        return next(BadRequest($t(req, 'error.400.missingUsernamePassword')));
    });

    return router;
}