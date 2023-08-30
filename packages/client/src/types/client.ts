import type { ApiTenant } from "./tenant";

export type ApiClient = {
    id: string;
    username: string;
    os: string;
    appVersion: string;
    hostname: string;
    lastPing: string;
    tenantId: string;
    active: boolean;
}