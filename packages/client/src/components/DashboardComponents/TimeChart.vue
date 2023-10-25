<script setup lang="ts">
import type { TimeSeriesPoint } from '@/types/dashboard';
import { computed } from 'vue';

const emits = defineEmits<{
    (event: 'zoom', minDate?: Date, maxDate?: Date): void,
}>();

const props = defineProps<{
    timeSeries: Array<{ data: TimeSeriesPoint[], label: string, stack?: string, fill?: string }>,
    color?: string,
    options?: {
        max?: number,
        min?: number,
    },
}>();

const sortedTimeSeries = computed(() => props.timeSeries.map(timeSeries => ({
    ...timeSeries,
    data: timeSeries.data.map(series => ({
        ...series,
        date: new Date(series.date),
    })).sort((a, b) => a.date.getTime() - b.date.getTime()),
})));

const series = computed(() => (sortedTimeSeries.value.map(timeSeries => ({
    name: timeSeries.label,
    data: timeSeries.data.map(point => ({ y: point.value, x: point.date.getTime() }))
}))));

const options = {
    xaxis: {
        type: 'datetime',
    },
    chart: {
        brush: {
            enabled: false,
            autoScaleYaxis: true,
        },
    },
    yaxis: {
        forceNiceScale: false,
        labels: {
            formatter: (value: number) => { return value.toFixed(2); },
        },
        max: props.options?.max,
        min: props.options?.min,
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

const onXAxisChanged = (_: any, b: { xaxis: { min: number, max: number } }) => {
    if (!b.xaxis.max || !b.xaxis.min) {
        emits('zoom', undefined, undefined);
        return;
    }

    const minDate = new Date(b.xaxis.min);
    const maxDate = new Date(b.xaxis.max);

    emits('zoom', minDate, maxDate);
};

</script>

<template>
    <div class="height">
        <apexchart @scrolled="onXAxisChanged" @zoomed="onXAxisChanged" height="100%" type="line" :options="options"
            :series="series"></apexchart>
    </div>
</template>

<style scoped>
.height {
    height: 100%;
}
</style>