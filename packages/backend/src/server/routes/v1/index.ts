import { Router } from "express";
import login from './login';
import clients from './client';

const router = Router();

router.use('/login', login);
router.use('/clients', clients);

export default router;