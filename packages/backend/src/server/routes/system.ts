import { Router } from "express";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { NotFound } from 'http-errors';
import { join } from "path";
import db from "../../lib/db";
import { $t } from "../../lib/locale/locale";
import mailer from "../../lib/mailer";
import { githubOperational } from "../../lib/github";

const router = Router();

const getVersion = async () => {
    return readFile(join(process.env.UPDATE_DIR ?? '.', 'version')).catch(() => '0.0.0.0').then((value) => value.toString());
}

router.get('/update/version', async (req, res, next) => {
    const version = await getVersion();

    res.send(version);
});

router.get('/update/file', async (req, res, next) => {
    const version = await getVersion();

    if (!existsSync(join(process.env.UPDATE_DIR ?? '.', version + '.zip'))) {
        return next(NotFound($t(req, 'error.404.missingUpdate', version)));
    }

    res.attachment('nucleus-remote-client.' + version + '.zip')
    res.sendFile(version + '.zip', {
        root: join(process.env.UPDATE_DIR ?? '.'),
    });
});

router.get('/health', async (req, res, next) => {
    const dbOperational = await db.$queryRaw`SELECT 1;`;
    const mailerOperational = mailer.operational;

    res.status((
        dbOperational
        && mailerOperational
    ) ? 200 : 500).json({
        dbOperational,
        mailerOperational,
        githubOperational: githubOperational(),
    });
});

export default router;