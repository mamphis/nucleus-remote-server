<script setup lang="ts">
import type { TimeSeriesPoint } from '@/types/dashboard';
import { CategoryScale, Chart, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'vue-chartjs';
Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{
    timeSeries: Array<{ data: TimeSeriesPoint[], label: string }>,
    color?: string,
    options?: {
        min?: number,
        stepSize?: number,
    },
}>()

const options = {
    responsive: true,
    scales: {
        y: {
            min: props.options?.min ?? 0,
            ticks: {
                stepSize: props.options?.stepSize ?? 1,
            }
        }
    }
};
const sortedTimeSeries = props.timeSeries.map(timeSeries => ({
    label: timeSeries.label,
    data: timeSeries.data.sort((a, b) => a.date.localeCompare(b.date))
}));
// get all timestamps and parse them as label
const labels = [...new Set(sortedTimeSeries.flatMap(timeSeries => timeSeries.data.map(point => point.date)))]
    .map(timestamp => new Date(timestamp)).map(date => date.toLocaleDateString());

const data = {
    labels,
    datasets: sortedTimeSeries.map(timeSeries => ({
        label: timeSeries.label,
        data: timeSeries.data.map(point => point.value),
        fill: false,
        tension: 0.1
    }))
};

</script>

<template>
    <Line :data="data" :options="options" />
</template>