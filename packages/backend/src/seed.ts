import { PrismaClient } from "@prisma/client";
import { hash } from 'bcrypt';
import { Logger } from "./lib/logger";
import { isProduction, randomString } from "./lib/util";
const needSeed = async (db: PrismaClient): Promise<boolean> => {
    return (await db.tenant.count()) === 0;
}

const seed = async (db: PrismaClient) => {
    const password = isProduction() ? randomString(10) : 'admin';
    const tenant = await db.tenant.create({
        data: {
            name: 'default'
        }
    });

    const addPermission = async (scope: string) => {
        return Promise.all([
            await db.permission.create({ data: { scope: `create:${scope}` } }),
            await db.permission.create({ data: { scope: `read:${scope}` } }),
            await db.permission.create({ data: { scope: `update:${scope}` } }),
            await db.permission.create({ data: { scope: `delete:${scope}` } }),
        ]);
    }
    const permissions = await Promise.all([
        await addPermission('tenant'),
        await addPermission('user'),
        await addPermission('tenant-user'),
        await addPermission('client'),
        await addPermission('group'),
        await addPermission('configuration'),
        await addPermission('task'),

        await db.permission.create({ data: { scope: 'special:admin' } }),
    ]);

    const admin = await db.user.create({
        data: {
            username: 'admin',
            password: await hash(password, 10),
            tenantId: tenant.id,
            permission: {
                connect: permissions.flatMap((elem) => elem),
            }
        }
    });

    Logger.info(`Created user ${admin.username} with password: ${password}`);
}

export {
    needSeed,
    seed
};
