import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import { BadRequest } from 'http-errors';
import mailer from '../../../lib/mailer';
import { randomString } from '../../../lib/util';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', async (req, res, next) => {
        const { mail } = req.body;
        if (mail) {
            const user = await db.user.findFirst({ where: { email: mail }, select: { id: true, tenantId: true, username: true, password: true, permission: true } });

            if (!user) {
                return res.status(204).end();
            }

            const onetimePassword = randomString(10);
            await db.user.update({
                where: {
                    id: user.id,
                }, 
                data: {
                    onetimePassword,
                }
            });

            mailer.sendResetPasswordMail(Object.assign({}, { mail }, { onetimePassword }));

            return res.status(204).end();
        }

        return next(BadRequest('please provide your mail address'));
    });

    return router;
}