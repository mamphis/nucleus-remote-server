import { PrismaClient } from "@prisma/client";
import { Logger } from "./logger";
import { MetricCounter } from "./metricCounter";

const db = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ]
});

const metrics = new MetricCounter<string, never>((key) => key.startsWith('INSERT INTO') && (key.includes('Metrics"') || key.includes('StatusCode"')));
export const getQueryMetrics = metrics.getMetrics.bind(metrics);

db.$on('query', (e) => {
    metrics.addMetric(e.query, e.duration);
});

db.$on('warn', (e) => {
    Logger.warn(e.message);
});

db.$on('error', (e) => {
    Logger.error(e.message);
});
export default db;