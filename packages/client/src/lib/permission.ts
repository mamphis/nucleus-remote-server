import userStore from "@/stores/user";
import type { ApiUser, AuthUser } from "@/types/user";


function getPermissions(user: AuthUser | ApiUser): string[] {
    if ('permission' in user) {
        return user.permission.map(p => p.scope);
    }

    return user.permissions;
}

export function hasPermission(user?: AuthUser | ApiUser, ...requiredPermissions: string[]) {
    let u = user;
    if (!u) {
        const { user } = userStore();
        if (!user) {
            return false;
        }
        u = user;
    }
    
    const userToCheck = u;
    return requiredPermissions.every(p => getPermissions(userToCheck).some(up => up.endsWith(p)));
}
