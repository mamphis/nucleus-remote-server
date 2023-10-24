<script setup lang="ts">
import { $t } from '@/lib/locale/locale';
import type { TimeSeriesPoint } from '@/types/dashboard';
import type { TooltipItem } from 'chart.js';
import { CategoryScale, Chart, Filler, Legend, LineElement, LinearScale, PointElement, TimeSeriesScale, Title, Tooltip, _adapters } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import customColors from './CustomChartFunctions/CustomColors';
import 'chartjs-adapter-date-fns';

const colors: string[] = [
    'rgb(255, 99, 132)',
    'rgb(52, 220, 192)',
    'rgb(54, 162, 235)',
    'rgb(255, 159, 64)',
    'rgb(200, 102, 200)',
]
Chart.register(zoomPlugin, Title, Tooltip, Legend, Filler, customColors(colors), LineElement, PointElement, CategoryScale, LinearScale, TimeSeriesScale);

const emits = defineEmits<{
    (event: 'zoom', minDate: Date, maxDate: Date, zoomLevel: number): void,
}>();

const props = defineProps<{
    timeSeries: Array<{ data: TimeSeriesPoint[], label: string, stack?: string, fill?: string }>,
    color?: string,
    options?: {
        min?: number,
        showTime?: boolean,
        stepSize?: number,
        stacked?: boolean,
    },
}>()

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            min: props.options?.min ?? 0,
            ticks: {
                stepSize: props.options?.stepSize ?? 1,
            },
            stacked: props.options?.stacked ?? false,
        },
        x: {
            type: 'time',
            time: {
                unit: props.options?.showTime ? 'minute' : 'day',
                displayFormats: {
                    minute: 'HH:mm:ss',
                    day: 'dd.MM.yyyy',
                },
            },
            min: new Date(new Date().getTime() - 2 * 60 * 60 * 1000).valueOf(),
        }
    },
    plugins: {
        zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                onPanComplete: ({ chart }: { chart: Chart }) => {
                    const minDate = new Date(chart.scales.x.min)
                    const maxDate = new Date(chart.scales.x.max)

                    emits('zoom', minDate, maxDate, chart.getZoomLevel());
                },
            },
            limits: {
                y: { min: -2, max: 'original' },
                x: { max: 'original'},
            },
            zoom: {
                onZoomComplete: ({ chart }: { chart: Chart }) => {
                    const minDate = new Date(chart.scales.x.min)
                    const maxDate = new Date(chart.scales.x.max)

                    emits('zoom', minDate, maxDate, chart.getZoomLevel());
                },
                wheel: {
                    enabled: true,
                    modifierKey: 'ctrl',
                },
                pinch: {
                    enabled: true
                },
                drag: {
                    enabled: true,
                    modifierKey: 'ctrl',
                    backgroundColor: 'rgba(127,127,127,0.3)',
                },
                mode: 'x',
            }
        },
        tooltip: {
            callbacks: {
                title: function (context: TooltipItem<'line'>[]) {
                    let label = $t('timechart.title.date');

                    const date = new Date(context[0].parsed.x);
                    label += date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                    return label;
                },
            }
        },
        filler: {
            propagate: true,
        }
    }
} as any;

const sortedTimeSeries = computed(() => props.timeSeries.map(timeSeries => ({
    label: timeSeries.label,
    data: timeSeries.data.sort((a, b) => a.date.localeCompare(b.date)),
    stack: timeSeries.stack,
    fill: timeSeries.fill,
})));

// get all timestamps and parse them as label
const labels = computed(() => [...new Set(sortedTimeSeries.value.flatMap(timeSeries => timeSeries.data.map(point => point.date)))]
    .map(timestamp => new Date(timestamp)));

const data = computed(() => ({
    labels: labels.value,
    datasets: sortedTimeSeries.value.map(timeSeries => ({
        label: timeSeries.label,
        data: timeSeries.data.map(point => point.value),
        stack: timeSeries.stack,
        fill: timeSeries.fill ?? 'origin',
        pointRadius: 2,
    }))
}));

</script>

<template>
    <Line :data="data" :options="chartOptions" />
</template>