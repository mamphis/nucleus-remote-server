import type { ApiClient } from "./client";
import type { ApiConfiguration } from "./configuration";

export type ApiGroup = {
    id: string;
    name: string;
    client: Omit<ApiClient, 'tenant'>[];
    configuration: Omit<ApiConfiguration, 'group' | 'task'>[];
};