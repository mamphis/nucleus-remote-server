import { Router } from "express";
import { NotFound } from 'http-errors';
import v1 from './v1';
import { $t } from "../../lib/locale/locale";

const router = Router();

router.use('/v1', v1);

router.use((req, _res, next) => {
    next(NotFound($t(req, 'error.404.invalidApiVersion', req.baseUrl)));
});

export default router;