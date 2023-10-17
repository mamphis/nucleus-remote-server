import type { ApiConfiguration } from "./configuration";

export type OutputType = 'All' | 'OnlyError' | 'Special';

export const outputTypes: OutputType[] = ['All', 'OnlyError', 'Special'];

export type ApiTask = {
    id: string;
    name: string;
    type: string;
    active: boolean;
    runOnce: boolean;
    content: string;
    output: OutputType,

    configuration: Omit<ApiConfiguration, 'task' | 'group'>;
}