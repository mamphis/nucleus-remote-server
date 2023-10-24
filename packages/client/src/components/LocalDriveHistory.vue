<script setup lang="ts">
import type { ApiLocalDriveHistory } from '@/types/localDrive';
import { computed } from 'vue';

const props = defineProps<{
    driveHistory: ApiLocalDriveHistory
}>()

const toGb = (bytes: number) => {
    return (bytes / 1024 / 1024 / 1024);
}

const sortedTimeSeries = computed(() =>
    props.driveHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
);

const series = computed(() => (
    [{
        name: 'Usage',
        data: sortedTimeSeries.value.map(point => ({ y: toGb(point.driveSize - point.driveFreeSpace), x: point.timestamp.getTime() }))
    }]
));

const options = {
    xaxis: {
        type: 'datetime',
    },
    chart: {
    },
    yaxis: {
        forceNiceScale: false,
        labels: {
            formatter: (value: number) => { return value.toFixed(2); },
        },
        max: Math.ceil(toGb(props.driveHistory[0].driveSize)),
        min: 0,
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 2,
    },
    tooltip: {
        x: {
            show: true,
            format: 'dd MMM HH:mm',
            formatter: undefined,
        },
        y: {
            formatter: (a?: number) => {
                return a?.toFixed(2);
            },
        },
    }
};

</script>

<template>
    <div class="height">
        <apexchart height="100%" width="100%" type="area" :options="options" :series="series"></apexchart>
    </div>
</template>

<style scoped>
.height {
    height: 100%;
    width: 100%;
}
</style>