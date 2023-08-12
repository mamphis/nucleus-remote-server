
import { Unauthorized, BadRequest, Forbidden } from 'http-errors';
import { Locals, NextFunction, Request, RequestHandler, Response } from "express";
import { sign, verify, JsonWebTokenError } from 'jsonwebtoken';
interface User {
    username: string;
    tenantId: string;
    permission: Array<{ scope: string }>
}

interface AuthUser {
    username: string;
    tenantId: string;
    permissions: string[];
}

interface AuthLocals extends Locals {
    readonly user: AuthUser;
}

interface ParamsDictionary {
    [key: string]: string;
}

interface ParsedQs { [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] }

interface AuthRequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery, AuthLocals> { }

const jwtSecret = process.env.JWT_SECRET ?? 'change-this-immidiately';

const getToken = (user: User): { token: string, user: AuthUser } => {
    const authUser = { username: user.username, tenantId: user.tenantId, permissions: user.permission.map(p => p.scope) };
    return { token: sign(authUser, jwtSecret), user: authUser };
}

const auth = (...scopes: string[]): AuthRequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const auth = req.headers.authorization;

        if (!auth) {
            return next(BadRequest('missing auth header'));
        }

        // Bearer ey.....
        const [method, value] = auth.split(' ');
        if (method !== 'Bearer') {
            return next(BadRequest('invalid auth method'));
        }

        try {
            const payload = verify(value, jwtSecret);
            let user: AuthUser;
            if (typeof payload === 'string') {
                user = JSON.parse(payload);
            } else {
                user = payload as AuthUser;
            }

            if (scopes.every(scope => user.permissions.includes(scope))) {
                return next();
            } else {
                return next(Forbidden(`You are missing the following scopes to do that: ${scopes.filter(s => !user.permissions.includes(s)).join()}`));
            }

        } catch (e: unknown) {
            if (e instanceof JsonWebTokenError) {
                return next(Unauthorized(e.message));
            }

            return next(e);
        }
    };
}

export {
    auth,
    getToken,
};