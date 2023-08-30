import type { ApiClient } from "./client";
import type { ApiUser } from "./user";

export type ApiTenant = {
    id: string;
    name: string;
    maxClients: number;
    user: Omit<ApiUser, 'permission' | 'tenant'>[];
    client: Pick<ApiClient, 'id' | 'active'>[]
};