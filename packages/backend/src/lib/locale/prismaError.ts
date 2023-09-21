import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { $t } from "./locale";
import { Request } from "express";

export const handlePrismaClientKnownRequestError = (req: Request, err: PrismaClientKnownRequestError): { status: number, name: string, message: string, type: string, path?: string } => {

    switch (err.code) {
        case 'P1008':
            return { status: 500, message: $t(req, 'error.prisma.timeout'), name: 'PrismaClientKnownRequestError', type: 'HttpError' };
        case 'P2002':
            return { status: 400, message: $t(req, 'error.prisma.duplicateKey', err.meta?.target), name: 'PrismaClientKnownRequestError', type: 'ValidationError', path: (err.meta?.target as string[])?.join('.') };
        case 'P2014':
            return { status: 400, message: $t(req, 'error.prisma.invalidId', err.meta?.target), name: 'PrismaClientKnownRequestError', type: 'ValidationError', path: (err.meta?.target as string[])?.join('.') };
        case 'P2003':
            return { status: 400, message: $t(req, 'error.prisma.invalidInput', err.meta?.target), name: 'PrismaClientKnownRequestError', type: 'ValidationError', path: (err.meta?.target as string[])?.join('.') };
        default:
            return { status: 500, message: err.message, name: 'PrismaClientKnownRequestError', type: 'HttpError' };
    }
}


