import { Router } from "express";
import { NotFound } from 'http-errors';
import v1 from './v1';

const router = Router();

router.use('/v1', v1);

router.use((req, _res, next) => {
    next(NotFound(`${req.baseUrl} is not a valid api version`));
})

export default router;