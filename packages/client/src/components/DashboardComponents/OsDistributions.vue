<script setup lang="ts">
import { ArcElement, Chart, Colors, Legend, Tooltip } from 'chart.js';
import { Pie } from 'vue-chartjs';

Chart.register(Colors, Tooltip, Legend, ArcElement);
Chart.overrides['pie'].plugins.legend.position = 'right';
Chart.overrides['pie'].aspectRatio = 2;

const props = defineProps<{
    osDistribution: Record<string, number>,
}>();

const data = {
    labels: Object.keys(props.osDistribution),
    datasets: [{
        data: Object.values(props.osDistribution),
    }],
}

const options = {
    responsive: true,
    cutout: '50%',
};
</script>

<template>
    <div>
        <h2 class="subtitle">{{ $t('dashboard.osDistribution') }}</h2>
        <Pie :data="data" :options="options" />
    </div>
</template>