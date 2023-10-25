import { PrismaClient, User } from "@prisma/client";
import { hash } from 'bcrypt';
import { Logger } from "./lib/logger";
import { isProduction, randomString } from "./lib/util";
const needSeed = async (db: PrismaClient): Promise<boolean> => {
    return (await db.tenant.count()) === 0;
}

const seedFeatureFlags = async (db: PrismaClient, tenant: { id: string; }) => {
    const features: Array<{ id: string, name: string }> = [
        { id: 'f-1.0.8-installed_apps', name: 'features.installed-apps' },
        { id: 'f-1.0.12-drive_monitor', name: 'features.drive-monitor' },
    ];

    return Promise.all(features.map(f => {
        return db.featureFlag.upsert({
            where: {
                tenantId_id: {
                    id: f.id,
                    tenantId: tenant.id,
                }
            },
            create: {
                ...f,
                tenantId: tenant.id,
                enabled: false,
            },
            update: {
                name: f.name,
            },
        });
    }));
}

const seedAdmin = async (db: PrismaClient, admin: User) => {
    const addPermission = async (scope: string) => {
        return Promise.all([
            await db.permission.upsert({ where: { scope: `create:${scope}` }, create: { scope: `create:${scope}` }, update: { scope: `create:${scope}` } }),
            await db.permission.upsert({ where: { scope: `read:${scope}` }, create: { scope: `read:${scope}` }, update: { scope: `read:${scope}` } }),
            await db.permission.upsert({ where: { scope: `update:${scope}` }, create: { scope: `update:${scope}` }, update: { scope: `update:${scope}` } }),
            await db.permission.upsert({ where: { scope: `delete:${scope}` }, create: { scope: `delete:${scope}` }, update: { scope: `delete:${scope}` } }),
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
        await addPermission('feature'),
        await addPermission('file'),

        await db.permission.upsert({ where: { scope: 'special:admin' }, create: { scope: 'special:admin' }, update: { scope: 'special:admin' } }),
    ]);

    await db.user.update({
        where: {
            username: admin.username,
        },
        data: {
            permission: {
                connect: permissions.flatMap(elem => elem),
            },
        },
    });
};

const seed = async (db: PrismaClient) => {
    const password = isProduction() ? randomString(10) : 'admin';
    const tenant = await db.tenant.create({
        data: {
            name: 'default'
        }
    });


    const admin = await db.user.create({
        data: {
            username: 'admin',
            password: await hash(password, 10),
            tenantId: tenant.id,
        }
    });

    await seedAdmin(db, admin);

    Logger.info(`Created user ${admin.username} with password: ${password}`);
}

export {
    needSeed,
    seed, seedAdmin, seedFeatureFlags
};

