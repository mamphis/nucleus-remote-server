import { Router } from "express";
import clients from './client';
import configurations from './configuration';
import groups from './group';
import login from './login';
import tasks from './task';
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
router.use('/groups', groups);
router.use('/configurations', configurations);
router.use('/tasks', tasks);

export default router;