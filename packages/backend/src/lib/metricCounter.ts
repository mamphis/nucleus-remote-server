type AdditionalArgs = string | number | symbol | never;
type Metrics<T extends AdditionalArgs> = {
    hitCount: number;
    avgDuration: number;
    maxDuration: number;
    // Allow to add metrics for different arguments. e.g. StatusCode 200, 404, 500 hitCount
    args: {
        [K in T]?: {
            hitCount: number;
        }
    }
}

export class MetricCounter<TKey, TArgs extends AdditionalArgs> {
    private metrics: Map<TKey, Metrics<TArgs>> = new Map();

    constructor(private readonly ignoreMetric?: (key: TKey) => boolean) {

    }

    addMetric(key: TKey, duration: number, args?: TArgs) {
        if (this.ignoreMetric && this.ignoreMetric(key)) {
            return;
        }

        const metrics = this.metrics.get(key);
        const updateArgs = () => {
            const m = this.metrics.get(key);
            if (!m) {
                return;
            }

            if (args) {
                if (m.args[args]) {
                    m.args[args]!.hitCount++;
                } else {
                    m.args[args] = { hitCount: 1 };
                }
            }
        }

        if (metrics) {
            metrics.hitCount++;
            metrics.avgDuration += (duration - metrics.avgDuration) / metrics.hitCount;
            metrics.maxDuration = Math.max(metrics.maxDuration, duration);
        } else {
            this.metrics.set(key, {
                hitCount: 1,
                avgDuration: duration,
                maxDuration: duration,
                args: {},
            });
        }

        updateArgs();
    }

    getMetrics() {
        const copy = new Map(this.metrics);
        this.metrics.clear();
        return copy;
    }
}