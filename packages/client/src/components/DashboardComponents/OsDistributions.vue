<script setup lang="ts">

const props = defineProps<{
    osDistribution: Record<string, number>,
}>();

const data = Object.values(props.osDistribution);


const options = {
    labels: Object.keys(props.osDistribution),
    legend: {
        position: 'right'
    }
};
</script>

<template>
    <div>
        <h2 class="subtitle">{{ $t('dashboard.osDistribution') }}</h2>
        <apexchart type="pie" :options="options" :series="data"></apexchart>
    </div>
</template>