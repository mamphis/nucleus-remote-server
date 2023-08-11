import { Router } from "express";
import { auth } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { userInfo } from "os";

const router = Router();
const db = new PrismaClient();

// GET localhost:8080/api/v1/clients/
router.get('/', auth('read:client'), async (req, res, next) => {
    const clients = await db.client.findMany({ where: { tenantId: res.locals.user.tenantId } });

    res.json(clients);
});

export default router;