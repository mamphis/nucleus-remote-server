
import { Locals, NextFunction, Request, RequestHandler, Response, Router } from "express";
import type * as core from 'express-serve-static-core';
import { BadRequest, Forbidden, Unauthorized } from 'http-errors';
import { JsonWebTokenError, sign, verify, TokenExpiredError } from 'jsonwebtoken';
import { Logger } from './logger';
import { isProduction } from './util';
import { $t } from "./locale/locale";

interface User {
    id: string;
    username: string;
    tenantId: string;
    permission: Array<{ scope: string }>
}

interface AuthUser {
    id: string;
    username: string;
    tenantId: string;
    permissions: string[];
}

interface AuthLocals extends Record<string, any> {
    user: AuthUser;
}

export interface AuthResponse extends Response {
    locals: AuthLocals
}

interface AuthRequest<Route extends string> extends core.Request<core.RouteParameters<Route>, any, any, any, AuthLocals> {

}

if (isProduction() && !process.env.JWT_SECRET) {
    Logger.fatal('Environment Variable "JWT_SECRET" must be set in a production environment!');
    process.exit(1);
}

const jwtSecret: string = process.env.JWT_SECRET ?? 'change-this-immidiately';

const getToken = (user: User): { token: string, user: AuthUser } => {
    const authUser = { username: user.username, tenantId: user.tenantId, id: user.id, permissions: user.permission.map(p => p.scope) };
    return {
        token: sign(authUser, jwtSecret, {
            expiresIn: '10m',
        }), user: authUser
    };
}

const getRefreshToken = (user: { username: string, id: string }) => {
    return sign({ username: user.username, id: user.id, ts: new Date().getTime(), }, jwtSecret);
}

function getPermissions(user: AuthUser | User): string[] {
    if ('permission' in user) {
        return user.permission.map(p => p.scope);
    }

    return user.permissions;
}

export function hasPermission(user: AuthUser | User, ...requiredPermissions: string[]) {
    const userToCheck = user;
    return requiredPermissions.every(p => getPermissions(userToCheck).some(up => up.endsWith(p)));
}

const auth = <Route extends string>(...scopes: string[]): core.RequestHandler<core.RouteParameters<Route>, any, any, any, AuthLocals> => {
    return (req: AuthRequest<Route>, res: AuthResponse, next: NextFunction) => {
        const auth = req.headers.authorization;

        if (!auth) {
            return next(BadRequest($t(req, 'error.400.missingAuthHeader')));
        }

        // Bearer ey.....
        const [method, value] = auth.split(' ');
        if (method !== 'Bearer') {
            return next(BadRequest($t(req, 'error.400.missingAuthHeader')));
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
                res.locals.user = user;
                return next();
            } else {
                return next(Forbidden($t(req, 'error.403.missingScopes', scopes.filter(s => !user.permissions.includes(s)).join())));
            }
        } catch (e: unknown) {
            if (e instanceof TokenExpiredError) {
                return next(Unauthorized('Token expired'));
            }

            if (e instanceof JsonWebTokenError) {
                return next(Unauthorized(e.message));
            }

            return next(e);
        }
    };

}

const refresh = (token: string) => {
    try {
        const payload = verify(token, jwtSecret);
        let user: AuthUser;
        if (typeof payload === 'string') {
            user = JSON.parse(payload);
        } else {
            user = payload as AuthUser;
        }

        return user;
    } catch (e: unknown) {

    }
}

export {
    auth,
    getToken,
    getRefreshToken,
    refresh,
};
