<script setup lang="ts">
import type { TimeSeriesPoint } from '@/types/dashboard';
import { CategoryScale, Chart, Legend, LineElement, LinearScale, PointElement, Title, Tooltip, Filler } from 'chart.js';
import { Line } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import { computed } from 'vue';
import customColors from './CustomColors';
import type { Scale, TooltipItem } from 'chart.js';
import type { CoreScaleOptions } from 'chart.js';
import { $t } from '@/lib/locale/locale';

const colors: string[] = [
    'rgb(255, 99, 132)',
    'rgb(52, 220, 192)',
    'rgb(54, 162, 235)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
]
Chart.register(zoomPlugin, Title, Tooltip, Legend, Filler, customColors(colors), LineElement, PointElement, CategoryScale, LinearScale);

const emits = defineEmits<{
    (event: 'zoom', minDate: Date, maxDate: Date): void,
}>();

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
    maintainAspectRatio: false,
    scales: {
        y: {
            min: props.options?.min ?? 0,
            ticks: {
                stepSize: props.options?.stepSize ?? 1,
            }
        },
        x: {
            ticks: {
                callback: function (value: number) {
                    const thisLabel = (this as unknown as Scale<CoreScaleOptions>).getLabelForValue(value) as unknown as Date;

                    if (props.options?.showTime) {
                        if (value > 0) {
                            const labelBefore = (this as unknown as Scale<CoreScaleOptions>).getLabelForValue(value - 1) as unknown as Date;
                            // Check if labelBefore is on a different day than thisLabel
                            if (labelBefore.getDate() !== thisLabel.getDate()) {
                                return thisLabel.toLocaleDateString() + ' ' + thisLabel.toLocaleTimeString();
                            }
                        }
                        return thisLabel.toLocaleTimeString();
                    } else {
                        return thisLabel.toLocaleDateString();
                    }
                }
            }
        }
    },
    plugins: {
        zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                onPanComplete: ({ chart }: { chart: Chart }) => {
                    const minDate = chart.scales.x.getLabelForValue(chart.scales.x.min) as unknown as Date;
                    const maxDate = chart.scales.x.getLabelForValue(chart.scales.x.max) as unknown as Date;

                    emits('zoom', minDate, maxDate);
                },
            },
            limits: {
                y: { min: -2, max: 'original' }
            },
            zoom: {
                onZoomComplete: ({ chart }: { chart: Chart }) => {
                    const minDate = chart.scales.x.getLabelForValue(chart.scales.x.min) as unknown as Date;
                    const maxDate = chart.scales.x.getLabelForValue(chart.scales.x.max) as unknown as Date;

                    emits('zoom', minDate, maxDate);
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
                    if (context[0].label !== null) {
                        const date = new Date(context[0].label);
                        label += date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    }
                    return label;
                },
            }
        },
    }
} as any;
const sortedTimeSeries = computed(() => props.timeSeries.map(timeSeries => ({
    label: timeSeries.label,
    data: timeSeries.data.sort((a, b) => a.date.localeCompare(b.date))
})));

// get all timestamps and parse them as label
const labels = computed(() => [...new Set(sortedTimeSeries.value.flatMap(timeSeries => timeSeries.data.map(point => point.date)))]
    .map(timestamp => new Date(timestamp)));

const data = computed(() => ({
    labels: labels.value,
    datasets: sortedTimeSeries.value.map(timeSeries => ({
        label: timeSeries.label,
        data: timeSeries.data.map(point => point.value),
        fill: true,
        tension: 0.2,
        pointRadius: 2,
    }))
}));

</script>

<template>
    <Line :data="data" :options="chartOptions" />
</template>