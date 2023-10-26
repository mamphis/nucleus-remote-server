import { Prisma, PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { NotFound, BadRequest } from 'http-errors';
import z from 'zod';
import multer from 'multer';
import { AuthResponse, auth, clientAuth } from "../../../lib/auth";
import { isProduction, randomString } from "../../../lib/util";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";

const download = async (db: PrismaClient, req: Request, res: Response, next: NextFunction) => {
    const file = await db.tenantFile.findFirst({
        where: { tenantId: res.locals.user.tenantId, id: req.params.id },
        select: {
            internalFilename: true,
            filename: true,
        },
    });

    if (!file) {
        return next(NotFound());
    }

    const dir = join(process.env.DATA_DIR ?? '.', isProduction() ? '.' : 'dev', res.locals.user.tenantId);
    const path = join(dir, file.internalFilename);

    res.download(path, file.filename);
}

export default function (db: PrismaClient) {
    const router = Router();

    router.post('/', auth('create:file'), multer({ limits: { fileSize: 5 * 1024 * 1024 } }).single('file'), async (req, res: AuthResponse, next) => {
        // create a unique filename
        // save the file to the disk
        // create a file record in the database
        if (!req.file) {
            return next(BadRequest('No file uploaded'));
        }

        const filename = req.file.originalname;
        const mimeType = req.file.mimetype;
        const fileSize = req.file.size;
        const internalFilename = randomString(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');

        const dir = join(process.env.DATA_DIR ?? '.', isProduction() ? '.' : 'dev', res.locals.user.tenantId);
        const path = join(dir, internalFilename);

        const { id } = await db.tenantFile.create({
            data: {
                filename,
                mimeType,
                fileSize,
                internalFilename,
                tenantId: res.locals.user.tenantId,
                uploadedByUserId: res.locals.user.id,
            },
            select: {
                id: true,
            },
        });

        await mkdir(dir, { recursive: true });
        await writeFile(path, req.file.buffer);

        res.json({ id });
    });

    router.get('/', auth('read:file'), async (req, res: AuthResponse, next) => {
        const files = await db.tenantFile.findMany({
            where: { tenantId: res.locals.user.tenantId },
            select: {
                id: true,
                filename: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
                uploadedBy: {
                    select: {
                        username: true,
                    }
                }
            }
        });
        return res.json(files);
    });

    router.get('/:id', auth('read:file'), async (req, res: AuthResponse, next) => {
        const file = await db.tenantFile.findFirst({
            where: { tenantId: res.locals.user.tenantId, id: req.params.id },
            select: {
                id: true,
                filename: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
                uploadedBy: {
                    select: {
                        username: true,
                    }
                }
            }
        });

        if (!file) {
            return next(NotFound());
        }

        return res.json(file);
    });

    router.get('/:id/download', auth('read:file'), download.bind(null, db));

    return router;
}



export const c2 = (db: PrismaClient) => {
    const router = Router();

    router.get('/:id/download', clientAuth, download.bind(null, db));
    return router;
};