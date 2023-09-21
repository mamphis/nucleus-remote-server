import { PrismaClient } from '@prisma/client';
import { Router } from "express";
import { BadRequest, InternalServerError } from 'http-errors';
import { AuthResponse, auth } from '../../../lib/auth';
import { createIssue } from '../../../lib/github';
import { $t } from '../../../lib/locale/locale';

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/createIssue', auth(), async (req, res: AuthResponse, next) => {
        const { content } = req.body;
        if (typeof content === 'string' && content.trim()) {
            const response = await createIssue(res.locals.user, content);
            if (response) {
                // TODO: Assign the issue id for each user. -> Retrive status for issue
                return res.json(response);
            }

            next(InternalServerError($t(req, 'error.500.issueCannotBeCreated')));
        }

        return next(BadRequest($t(req, 'error.400.missingDescription')));
    });

    return router;
}
