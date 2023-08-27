import { Router } from "express";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { NotFound } from 'http-errors';

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
        return next(NotFound(version + ' has no content.'))
    }

    res.sendFile(version + '.zip', {
        root: join(process.env.UPDATE_DIR ?? '.'),
    });
});

export default router;