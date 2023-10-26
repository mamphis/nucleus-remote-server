type Metrics = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
}

export type StatementMetrics = Metrics & {
    query: string;
};

export type SqlHistogram = Metrics & {
    bucketTime: string
}

export type RequestHistogram = SqlHistogram & {
    statusCodes: {
        statusCode: number;
        hitCount: number;
    }[];
}

export type RequestMetrics = Metrics & {
    requestPath: string;
}

export type ApiStatementMetrics = {
    statementMetrics: StatementMetrics[];
}

export type ApiHistogram = {
    histogram: SqlHistogram[];
}

export type ApiRequestMetrics = {
    requestMetrics: RequestMetrics[];
}
export type ApiRequestHistogram = {
    histogram: RequestHistogram[];
}

export type StatisticValue = number | {
    formatterName: string;
    value: number;
}

export type ApiStatistics = {
    clientCount: StatisticValue;
    userCount: StatisticValue;
    tenantCount: StatisticValue;
    groupCount: StatisticValue;
    taskCount: StatisticValue;
    notificationCount: StatisticValue;
    configurationCount: StatisticValue;
    fileCount: StatisticValue;
    fileSize: StatisticValue;
}

type SortDirection = 'asc' | 'desc';
export type SortKey<K, T> = keyof K | T;
export type SortOrder<K, T> = [SortKey<K, T> | undefined, SortDirection | undefined];