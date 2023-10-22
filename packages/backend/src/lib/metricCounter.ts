type Metrics = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
}

export class MetricCounter<TKey> {
    private metrics: Map<TKey, Metrics> = new Map();

    constructor(private readonly ignoreMetric?: (key: TKey) => boolean) {

    }

    addMetric(key: TKey, duration: number) {
        if (this.ignoreMetric && this.ignoreMetric(key)) {
            return;
        }

        const metrics = this.metrics.get(key);
        if (metrics) {
            metrics.hitCount++;
            metrics.avgDuration += (duration - metrics.avgDuration) / metrics.hitCount;
            metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        } else {
            this.metrics.set(key, {
                hitCount: 1,
                avgDuration: duration,
                maxDuration: duration,
            });
        }
    }

    getMetrics() {
        const copy = new Map(this.metrics);
        this.metrics.clear();
        return copy;
    }
}