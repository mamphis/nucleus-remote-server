type Metrics = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
}

export type StatementMetrics = Metrics & {
    query: string;
};

export type Histogram = Metrics & {
    bucketTime: string
}

export type RequestMetrics = Metrics & {
    requestPath: string;
}

export type ApiStatementMetrics = {
    statementMetrics: StatementMetrics[];
}

export type ApiHistogram = {
    histogram: Histogram[];
}

export type ApiRequestMetrics = {
    requestMetrics: RequestMetrics[];
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
export type SortKey<K, T> = keyof K | T;
export type SortOrder<K, T> = [SortKey<K, T> | undefined, SortDirection | undefined];