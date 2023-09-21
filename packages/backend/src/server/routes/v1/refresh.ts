import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Router } from "express";
import { BadRequest, NotFound } from 'http-errors';
import { getRefreshToken, getToken, refresh } from '../../../lib/auth';
import { $t } from '../../../lib/locale/locale';
import { decode } from 'jsonwebtoken';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', async (req, res, next) => {
        const { refreshToken } = req.body;
        if (refreshToken && typeof refreshToken === 'string') {
            const refreshUser = refresh(refreshToken);
            if (!refreshUser) {
                return next(BadRequest($t(req, 'error.400.invalidRefreshToken')));
            }

            const user = await db.user.findFirst({
                where: {
                    username: refreshUser.username
                },
                select: {
                    id: true,
                    tenantId: true,
                    username: true,
                    password: true,
                    permission: true
                },
            });

            if (!user) {
                return next(NotFound($t(req, 'error.404.noUserFound')));
            }

            const { token, user: authUser } = getToken(user);

            return res.json({ token, user: authUser, refreshToken: getRefreshToken(user) });
        }

        return next(BadRequest($t(req, 'error.400.missingUsernamePassword')));
    });

    return router;
}