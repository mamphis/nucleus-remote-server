import type { ApiUser } from "./user";

export type ApiTenant = {
    id: string;
    name: string;
    user: Omit<ApiUser, 'permission' | 'tenant'>[];
};