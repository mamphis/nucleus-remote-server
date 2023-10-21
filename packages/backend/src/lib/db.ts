import { PrismaClient } from "@prisma/client";
import { Logger } from "./logger";

const db = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ]
});
type Metrics = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
}

const queryMetrics = new Map<string, Metrics>();

const updateMetrics = (query: string, duration: number) => {
    const metrics = queryMetrics.get(query);
    if (metrics) {
        metrics.hitCount++;
        metrics.avgDuration += (duration - metrics.avgDuration) / metrics.hitCount;
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    } else {
        queryMetrics.set(query, {
            hitCount: 1,
            avgDuration: duration,
            maxDuration: duration,
        });
    }
}

export const getMetrics = () => {
    // make a copy of the query metrics, clear the original and return the copy
    const copy = new Map(queryMetrics);
    queryMetrics.clear();
    return copy;
}

db.$on('query', (e) => {
    updateMetrics(e.query, e.duration);
});

db.$on('warn', (e) => {
    Logger.warn(e.message);
});

db.$on('error', (e) => {
    Logger.error(e.message);
});
export default db;