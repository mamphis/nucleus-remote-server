import type { ApiUser, AuthUser } from "@/types/user";


function getPermissions(user: AuthUser | ApiUser): string[] {
    if ('id' in user) {
        return user.permission.map(p => p.scope);
    }

    return user.permissions;
}

export function hasPermission(user?: AuthUser | ApiUser, ...requiredPermissions: string[]) {
    if (!user) {
        return false;
    }

    return requiredPermissions.every(p => getPermissions(user).some(up => up.endsWith(p)));
}
