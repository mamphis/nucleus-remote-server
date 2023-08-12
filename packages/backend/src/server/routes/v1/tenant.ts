import { Router } from "express";
import { auth } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { userInfo } from "os";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/tenants/
router.get('/', auth('read:tenant'), async (req, res, next) => {
    if (res.locals.user.permissions.includes('special:admin')) {
        const tenants = await db.tenant.findMany();
        return res.json(tenants);
    }

    const tenants = await db.tenant.findMany({ where: { user: { some: { username: res.locals.user.username } } } });
    return res.json(tenants);
});

export default router;