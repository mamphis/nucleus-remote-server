type StatementMetrics = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
    query: string;
};

export type Histogram = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
    bucketTime: string
}

export type ApiQueryMetrics = {
    queryMetrics: {
        statementMetrics: StatementMetrics[];
        histogram: Histogram[];
    },
}

export type ApiStatistics = {
    clientCount: number;
    userCount: number;
    tenantCount: number;
    groupCount: number;
    taskCount: number;
    notificationCount: number;
    configurationCount: number;
}

type SortDirection = 'asc' | 'desc';
export type SortKey<T> = keyof StatementMetrics | T;
export type SortOrder<T> = [SortKey<T> | undefined, SortDirection | undefined];