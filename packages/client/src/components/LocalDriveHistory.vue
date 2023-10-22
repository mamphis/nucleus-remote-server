<script setup lang="ts">
import { formatDate } from '@/lib/utils';
import type { ApiLocalDriveHistory } from '@/types/localDrive';
import { CategoryScale, Chart, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip,  } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import customColors from './DashboardComponents/CustomColors';

const colors: string[] = [
    'rgb(255, 99, 132)',
    'rgb(52, 220, 192)',
    'rgb(54, 162, 235)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
]
Chart.register(zoomPlugin, Title, Tooltip, Legend, Filler, customColors(colors), CategoryScale, LineElement, PointElement, LinearScale);

const props = defineProps<{
    driveHistory: ApiLocalDriveHistory
}>()

const toGb = (bytes: number) => {
    return (bytes / 1024 / 1024 / 1024);
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            min: 0,
            max: Math.ceil(Math.max(...props.driveHistory.map(driveHistory => toGb(driveHistory.driveSize)))),
        },
        x: {
            display: false,
        }
    },
    plugins: {
        zoom: {
            pan: {
                enabled: true,
                mode: 'xy',

            }, limits: {
                y: { min: -2, max: 'original' }
            },
            zoom: {
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
                },
                mode: 'xy',
            }
        },
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y.toFixed(2) + ' GB';
                    }
                    return label;
                }
            }
        },
    }
} as any;

const sortedTimeSeries = computed(() => props.driveHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
const labels = computed(() => sortedTimeSeries.value.map(driveHistory => formatDate(driveHistory.timestamp)));
const data = computed(() => ({
    labels: labels.value,
    datasets: [{
        label: 'Used Space',
        data: sortedTimeSeries.value.map(driveHistory => toGb(driveHistory.driveSize - driveHistory.driveFreeSpace)),
        fill: false,
        tension: 0.1,
        pointRadius: 2,
    }]
}));

</script>

<template>
    <Line :data="data" :options="chartOptions" />
</template>