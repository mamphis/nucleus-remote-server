import type { ApiGroup } from "./group";

export type ApiConfiguration = {
    id: string;
    name: string;
    group: Omit<ApiGroup, 'configuration' | 'client'>[],
    task: any[];
};