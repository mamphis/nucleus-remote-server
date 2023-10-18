export type TimeSeriesPoint = {
    date: string;
    value: number;
};

export type HistoryData = {
    activeClients: TimeSeriesPoint[];
    totalClients: TimeSeriesPoint[];
};

export type ApiDashboardData = {
    historyData: HistoryData;
    tenantStatistics: {
        clientCount: number;
        activeClients: number;
        maxClients: number;
    },
    osDistribution: Record<string, number>;
};