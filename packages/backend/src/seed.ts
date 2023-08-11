import { randomBytes } from 'crypto'
import { hash } from 'bcrypt';
import { PrismaClient } from "@prisma/client";
const needSeed = async (db: PrismaClient): Promise<boolean> => {
    return (await db.tenant.count()) === 0;
}

const randomString = (length: number) => {
    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "1234567890" +
        "!#+.-_";

    return [...randomBytes(length)].map(n => alphabet.at(n % alphabet.length)).join('');
}

const seed = async (db: PrismaClient) => {
    const password = randomString(10);
    const tenant = await db.tenant.create({
        data: {
            name: 'default'
        }
    });

    await db.permission.create({ data: { scope: 'create:tenant' } });
    await db.permission.create({ data: { scope: 'read:tenant' } });
    await db.permission.create({ data: { scope: 'update:tenant' } });

    await db.permission.create({ data: { scope: 'create:user' } });
    await db.permission.create({ data: { scope: 'read:user' } });
    await db.permission.create({ data: { scope: 'update:user' } });

    await db.permission.create({ data: { scope: 'create:tenant-user' } });
    await db.permission.create({ data: { scope: 'read:tenant-user' } });
    await db.permission.create({ data: { scope: 'update:tenant-user' } });

    await db.permission.create({ data: { scope: 'create:client' } });
    await db.permission.create({ data: { scope: 'read:client' } });
    await db.permission.create({ data: { scope: 'update:client' } });

    await db.permission.create({ data: { scope: 'create:group' } });
    await db.permission.create({ data: { scope: 'read:group' } });
    await db.permission.create({ data: { scope: 'update:group' } });

    await db.permission.create({ data: { scope: 'create:configuration' } });
    await db.permission.create({ data: { scope: 'read:configuration' } });
    await db.permission.create({ data: { scope: 'update:configuration' } });

    await db.permission.create({ data: { scope: 'create:task' } });
    await db.permission.create({ data: { scope: 'read:task' } });
    await db.permission.create({ data: { scope: 'update:task' } });

    const admin = await db.user.create({
        data: {
            username: 'admin',
            password: await hash(password, 10),
            tenantId: tenant.id,
            permission: {
                connect: [
                    { scope: 'create:tenant' },
                    { scope: 'read:tenant' },
                    { scope: 'update:tenant' },
                    { scope: 'create:user' },
                    { scope: 'read:user' },
                    { scope: 'update:user' },
                    { scope: 'create:tenant-user' },
                    { scope: 'read:tenant-user' },
                    { scope: 'update:tenant-user' },
                    { scope: 'create:client' },
                    { scope: 'read:client' },
                    { scope: 'update:client' },
                    { scope: 'create:group' },
                    { scope: 'read:group' },
                    { scope: 'update:group' },
                    { scope: 'create:configuration' },
                    { scope: 'read:configuration' },
                    { scope: 'update:configuration' },
                    { scope: 'create:task' },
                    { scope: 'read:task' },
                    { scope: 'update:task' },
                ]
            }

        }
    });

    console.log(`Created user ${admin.username} with password: ${password}`);
}

export {
    needSeed,
    seed
}