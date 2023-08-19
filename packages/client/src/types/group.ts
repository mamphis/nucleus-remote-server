import type { ApiConfiguration } from "./configuration";

export type ApiGroup = {
    id: string;
    name: string;
    client: any[];
    configuration: Omit<ApiConfiguration, 'group' | 'task'>[];
};