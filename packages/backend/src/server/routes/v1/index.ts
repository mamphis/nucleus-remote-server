import { Router } from "express";
import { NotFound } from 'http-errors';
import db from "../../../lib/db";
import { $t } from "../../../lib/locale/locale";
import admin from "./admin";
import c2 from "./c2";
import clients from './client';
import configurations from './configuration';
import dashboard from "./dashboard";
import groups from './group';
import login from './login';
import misc from "./misc";
import notification from "./notification";
import refresh from "./refresh";
import resetPassword from "./resetPassword";
import tasks from './task';
import tenants from './tenant';
import tenantUsers from './tenantUser';
import users from './user';
import verify from './verify';

const router = Router();

router.use('/login', login(db));
router.use('/verify', verify(db));
router.use('/refresh', refresh(db));
router.use('/resetPassword', resetPassword(db));
router.use('/clients', clients(db));
router.use('/users', users(db));
router.use('/tenants', tenants(db));
router.use('/tenant-users', tenantUsers(db));
router.use('/groups', groups(db));
router.use('/configurations', configurations(db));
router.use('/tasks', tasks(db));
router.use('/misc', misc(db));
router.use('/notifications', notification(db));
router.use('/c2', c2(db));
router.use('/dashboard', dashboard(db));
router.use('/admin', admin(db));

router.use((req, _res, next) => {
    next(NotFound($t(req, 'error.404.invalidApiRoute', 'v1', req.baseUrl)));
})


export default router;