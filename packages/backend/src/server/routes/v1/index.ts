import { Router } from "express";
import clients from './client';
import login from './login';
import tenants from './tenant';
import tenantUsers from './tenantUser';
import users from './user';
import verify from './verify';

const router = Router();

router.use('/login', login);
router.use('/verify', verify);
router.use('/clients', clients);
router.use('/users', users);
router.use('/tenants', tenants);
router.use('/tenant-users', tenantUsers);

export default router;