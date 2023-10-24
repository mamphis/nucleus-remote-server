<script setup lang="ts">
import TimeChart from '@/components/DashboardComponents/TimeChart.vue';
import { $t } from '@/lib/locale/locale';
import request from '@/lib/request';
import type { ApiRequestHistogram, ApiRequestMetrics, RequestMetrics, SortKey, SortOrder } from '@/types/metrics';
import { computed, onUnmounted, ref } from 'vue';
import SortOrderComp from './SortOrder.vue';
import { debounce } from '@/lib/debounce';
import type { TimeSeriesPoint } from '@/types/dashboard';

const metrics = ref<ApiRequestMetrics>({ requestMetrics: [] });
const histogramRequest = await request.$get<ApiRequestHistogram>('admin/requestHistogram')
const histogram = histogramRequest.assertNotError().toRef();

type AdditionalSortKey = 'load';

const sortOrder = ref<SortOrder<RequestMetrics, AdditionalSortKey>>([undefined, 'desc']);
const searchValue = ref('');

let lastMin: Date | undefined;
let lastMax: Date | undefined;

const queries = computed(() => {
    const stmts = metrics.value.requestMetrics
        .map((s) => ({ ...s, load: s.avgDuration * s.hitCount }))
        .filter((s) => s.requestPath.toLowerCase().includes(searchValue.value.toLowerCase()));

    const [sortKey, sortDirection] = sortOrder.value;
    if (sortKey) {
        return stmts.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (aVal < bVal) {
                return sortDirection === 'asc' ? -1 : 1;
            } else if (aVal > bVal) {
                return sortDirection === 'asc' ? 1 : -1;
            } else {
                return 0;
            }
        });
    }
    return stmts;
});

const history = computed(() => {
    let hist = histogram.value.histogram;
    // const hitSeries: TimeSeriesPoint[] = [];
    const avgSeries: TimeSeriesPoint[] = [];
    const maxSeries: TimeSeriesPoint[] = [];
    const statusSeries: TimeSeriesPoint[][] = [];
    const statusCodes = new Set<number>(hist.flatMap((h) => h.statusCodes.map((s) => s.statusCode)));

    hist.forEach((value) => {
        // hitSeries.push({ date: value.bucketTime, value: value.hitCount });
        avgSeries.push({ date: value.bucketTime, value: value.avgDuration });
        maxSeries.push({ date: value.bucketTime, value: value.maxDuration });
        for (const statusCode of statusCodes) {
            statusSeries[statusCode] = statusSeries[statusCode] ?? [];
            statusSeries[statusCode].push({ date: value.bucketTime, value: value.statusCodes.find((s) => s.statusCode === statusCode)?.hitCount ?? 0 });
        }
    });

    const data = [
        ...statusSeries.map((s, i) => ({ data: s, label: `HTTP ${i}`, stack: 'exec', fill: 'stack', })).filter(Boolean),
        // { data: hitSeries, label: $t('admin.metrics.executions'), stack: 'hits', },
        { data: avgSeries, label: $t('admin.metrics.avgDuration'), stack: 'avg', },
        { data: maxSeries, label: $t('admin.metrics.maxDuration'), stack: 'max', },
    ];

    return data.filter(Boolean);
});

const changeSortOrder = (sortKey: SortKey<RequestMetrics, AdditionalSortKey>) => {
    if (sortOrder.value[0] === sortKey) {
        if (sortOrder.value[1] === 'asc') {
            sortOrder.value = [undefined, 'desc'];
        } else if (sortOrder.value[1] === 'desc') {
            sortOrder.value = [sortKey, 'asc'];
        }
    } else {
        sortOrder.value = [sortKey, 'desc'];
    }
}

const updateInterval = setInterval(() => {
    debounceUpdate(lastMin, lastMax)
}, 30000);

onUnmounted(() => {
    clearInterval(updateInterval);
});

const debounceUpdate = debounce((minDate?: Date, maxDate?: Date) => {
    const min = minDate?.toISOString();
    const max = maxDate?.toISOString();

    lastMin = minDate;
    lastMax = maxDate;

    let metricsUrl = 'admin/requestMetrics';
    if (min && max) {
        metricsUrl += `?min=${min}&max=${max}`;
    }

    request.$get<ApiRequestMetrics>(metricsUrl).then((response) => {
        metrics.value = response.assertNotError();
    });
}, 500);

debounceUpdate();

</script>

<template>
    <div class="is-half-height">
        <TimeChart :options="{  }" :time-series="history"
            @zoom="debounceUpdate" />
    </div>
    <div class="field mt-2">
        <input type="text" class="input" :placeholder="$t('admin.metrics.searchPlaceholder')" v-model="searchValue">
    </div>
    <table class="table is-striped is-fullwidth">
        <thead>
            <tr>
                <th @click="changeSortOrder('requestPath')">{{ $t('admin.metrics.requestPath') }}
                    <SortOrderComp :metric="'requestPath'" :sort-order="sortOrder" />
                </th>
                <th @click="changeSortOrder('hitCount')">{{ $t('admin.metrics.executions') }}
                    <SortOrderComp :metric="'hitCount'" :sort-order="sortOrder" />
                </th>
                <th @click="changeSortOrder('avgDuration')">{{ $t('admin.metrics.avgDuration') }}
                    <SortOrderComp :metric="'avgDuration'" :sort-order="sortOrder" />
                </th>
                <th @click="changeSortOrder('maxDuration')">{{ $t('admin.metrics.maxDuration') }}
                    <SortOrderComp :metric="'maxDuration'" :sort-order="sortOrder" />
                </th>
                <th @click="changeSortOrder('load')">{{ $t('admin.metrics.load') }}
                    <SortOrderComp :metric="'load'" :sort-order="sortOrder" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="query in queries" :key="query.requestPath">
                <td>{{ query.requestPath }}</td>
                <td>{{ query.hitCount }}</td>
                <td>{{ query.avgDuration.toFixed(2) }}</td>
                <td>{{ query.maxDuration.toFixed(2) }}</td>
                <td>{{ query.load.toFixed(2) }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.table th {
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    white-space: nowrap;
}

.is-half-height {
    height: 50vh;
}
</style>