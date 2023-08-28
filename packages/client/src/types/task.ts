import type { ApiConfiguration } from "./configuration";

export type ApiTask = {
    id: string;
    name: string;
    type: string;
    active: boolean;
    runOnce: boolean;
    content: string;

    configuration: Omit<ApiConfiguration, 'task' | 'group'>;
}