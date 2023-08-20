import type { ApiGroup } from "./group";
import type { ApiTask } from "./task";

export type ApiConfiguration = {
    id: string;
    name: string;
    group: Omit<ApiGroup, 'configuration' | 'client'>[],
    task: ApiTask[];
};