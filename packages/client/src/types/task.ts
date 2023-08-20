import type { ApiConfiguration } from "./configuration";

export type ApiTask = {
    id: string;
    name: string;
    type: string;
    content: string;

    configuration: Omit<ApiConfiguration, 'task' | 'group'>;
}