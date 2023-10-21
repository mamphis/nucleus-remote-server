<script setup lang="ts">
import type { TimeSeriesPoint } from '@/types/dashboard';
import { CategoryScale, Chart, Legend, LineElement, LinearScale, Colors, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import { computed } from 'vue';
Chart.register(zoomPlugin, Colors, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps<{
    timeSeries: Array<{ data: TimeSeriesPoint[], label: string }>,
    color?: string,
    options?: {
        min?: number,
        showTime?: boolean,
        stepSize?: number,
    },
}>()

const chartOptions = {
    responsive: true,
    scales: {
        y: {
            min: props.options?.min ?? 0,
            ticks: {
                stepSize: props.options?.stepSize ?? 1,
            }
        }
    },
    plugins: {
        zoom: {
            pan: {
                enabled: true,
                mode: 'xy',

            }, limits: {
                y: { min: 0, max: 'original' }
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true
                },

                mode: 'xy',
            }
        }
    }
} as any;
const sortedTimeSeries = computed(() => props.timeSeries.map(timeSeries => ({
    label: timeSeries.label,
    data: timeSeries.data.sort((a, b) => a.date.localeCompare(b.date))
})));

// get all timestamps and parse them as label
const labels = computed(() => [...new Set(sortedTimeSeries.value.flatMap(timeSeries => timeSeries.data.map(point => point.date)))]
    .map(timestamp => new Date(timestamp)).map(date => props?.options?.showTime ? date.toLocaleTimeString() : date.toLocaleDateString()));

const data = computed(() => ({
    labels: labels.value,
    datasets: sortedTimeSeries.value.map(timeSeries => ({
        label: timeSeries.label,
        data: timeSeries.data.map(point => point.value),
        fill: false,
        tension: 0.1
    }))
}));

</script>

<template>
    <Line :data="data" :options="chartOptions" />
</template>