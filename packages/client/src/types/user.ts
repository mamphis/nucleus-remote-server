import type { ApiTenant } from "./tenant";

export type ApiUser = {
    username: string;
    id: string;
    permission: Array<{ scope: string }>;
    tenant: ApiTenant;
};

export type AuthUser = {
    username: string;
    tenantId: string;
    permissions: string[];
}