import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import clients from './client';
import configurations from './configuration';
import groups from './group';
import login from './login';
import misc from "./misc";
import tasks from './task';
import tenants from './tenant';
import tenantUsers from './tenantUser';
import users from './user';
import verify from './verify';
import resetPassword from "./resetPassword";

const router = Router();
const db = new PrismaClient();

router.use('/login', login(db));
router.use('/verify', verify(db));
router.use('/resetPassword', resetPassword(db));
router.use('/clients', clients(db));
router.use('/users', users(db));
router.use('/tenants', tenants(db));
router.use('/tenant-users', tenantUsers(db));
router.use('/groups', groups(db));
router.use('/configurations', configurations(db));
router.use('/tasks', tasks(db));
router.use('/misc', misc(db));

export default router;