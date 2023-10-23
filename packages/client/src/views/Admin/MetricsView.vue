<script setup lang="ts">
import TimeChart from '@/components/DashboardComponents/TimeChart.vue';
import { $t } from '@/lib/locale/locale';
import request from '@/lib/request';
import type { TimeSeriesPoint } from '@/types/dashboard';
import type { ApiStatementMetrics, ApiHistogram, SortKey, SortOrder, StatementMetrics } from '@/types/metrics';
import { computed, ref } from 'vue';
import SortOrderComp from './SortOrder.vue';
import { debounce } from '@/lib/debounce';

const metricsResponse = await request.$get<ApiStatementMetrics>('admin/sqlMetrics');
const metrics = metricsResponse.assertNotError().toRef();
const histogramResponse = await request.$get<ApiHistogram>('admin/sqlHistogram');
const histogram = histogramResponse.assertNotError().toRef();

type AdditionalSortKey = 'load';

const sortOrder = ref<SortOrder<StatementMetrics, AdditionalSortKey>>([undefined, 'desc']);

const queries = computed(() => {
    const stmts = metrics.value.statementMetrics.map((s) => ({ ...s, load: s.avgDuration * s.hitCount }));

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
    const hist = histogram.value.histogram;
    const hitSeries: TimeSeriesPoint[] = [];
    const avgSeries: TimeSeriesPoint[] = [];
    const maxSeries: TimeSeriesPoint[] = [];
    hist.forEach((value) => {
        hitSeries.push({ date: value.bucketTime, value: value.hitCount });
        avgSeries.push({ date: value.bucketTime, value: value.avgDuration });
        maxSeries.push({ date: value.bucketTime, value: value.maxDuration });
    });

    return [
        { data: hitSeries, label: $t('admin.metrics.executions') },
        { data: avgSeries, label: $t('admin.metrics.avgDuration') },
        { data: maxSeries, label: $t('admin.metrics.maxDuration') },
    ];
});

const changeSortOrder = (sortKey: SortKey<StatementMetrics, AdditionalSortKey>) => {
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

let lastMin: Date | undefined;
let lastMax: Date | undefined;
setInterval(() => {
    debounceUpdate(lastMin, lastMax)
}, 30000);

const debounceUpdate = debounce((minDate?: Date, maxDate?: Date) => {
    const min = minDate?.toISOString();
    const max = maxDate?.toISOString();

    lastMin = minDate;
    lastMax = maxDate;

    let url = 'admin/sqlMetrics';
    if (min && max) {
        url += `?min=${min}&max=${max}`;
    }

    request.$get<ApiStatementMetrics>(url).then((response) => {
        metrics.value = response.assertNotError();
    });
    request.$get<ApiHistogram>('admin/sqlHistogram').then((response) => {
        histogram.value = response.assertNotError();
    });
}, 500);

</script>

<template>
    <TimeChart :options="{ stepSize: 1, showTime: true }" :time-series="history"
        @zoom="(minDate, maxDate) => debounceUpdate(minDate, maxDate)" />
    <table class="table is-striped">
        <thead>
            <tr>
                <th @click="changeSortOrder('query')">{{ $t('admin.metrics.query') }}
                    <SortOrderComp :metric="'query'" :sort-order="sortOrder" />
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
            <tr v-for="query in queries" :key="query.query">
                <td>{{ query.query }}</td>
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
</style>