import { Router } from "express";
import login from './login';
import verify from './verify';
import clients from './client';
import users from './user';
import tenants from './tenant';

const router = Router();

router.use('/login', login);
router.use('/verify', verify);
router.use('/clients', clients);
router.use('/users', users);
router.use('/tenants', tenants);

export default router;