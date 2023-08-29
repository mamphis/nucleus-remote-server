import type { ApiTenant } from "./tenant";

export type ApiUser = {
    username: string;
    id: string;
    permission: Array<{ scope: string }>;
    email: string;
    tenant: ApiTenant;
};

export type AuthUser = {
    id: string;
    username: string;
    tenantId: string;
    permissions: string[];
}