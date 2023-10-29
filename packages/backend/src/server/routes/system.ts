import { Router } from "express";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { NotFound } from 'http-errors';
import { join } from "path";
import db from "../../lib/db";
import { $t } from "../../lib/locale/locale";
import mailer from "../../lib/mailer";
import { githubOperational } from "../../lib/github";
import { rateLimit } from 'express-rate-limit';
import { z } from "zod";

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

router.post('/contact', rateLimit({
    limit: 5,
    windowMs: 1000 * 60 * 60,
}), async (req, res, next) => {
    const schema = z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        company: z.string().min(1),
        clients: z.number().int().min(1),
        message: z.string().min(1),
    });

    try {
        const data = schema.parse(req.body);

        const text = `
        <h1>Kontaktanfrage</h1>
        <p>
            <b>Vorname:</b> ${data.firstname}<br>
            <b>Nachname:</b> ${data.lastname}<br>
            <b>E-Mail:</b> ${data.email}<br>    
            <b>Telefon:</b> ${data.phone}<br>
            <b>Firma:</b> ${data.company}<br>
            <b>Clientanzahl:</b> ${data.clients}<br>
        </p>
        <p>
            <b>Nachricht:</b><br>
            ${data.message}
        </p>`;
        mailer.sendContactMail(text, 'nrs-contact@pcsmw.de');
    } catch (error) {
        return next(error);
    }

    res.status(204).end();
});

export default router;