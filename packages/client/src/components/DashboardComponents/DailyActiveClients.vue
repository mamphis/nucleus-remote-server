<script setup lang="ts">
import type { HistoryData } from '@/types/dashboard';
import TimeChart from './TimeChart.vue';
import type { $t } from '@/lib/locale/locale';
const props = defineProps<{
    historyData: HistoryData,
}>();

const options = {
    max: Math.max(...props.historyData.totalClients.map((s) => s.value), ...props.historyData.activeClients.map((s) => s.value)) + 1,
}
</script>
<template>
    <div>
        <h2 class="subtitle">{{ $t('dashboard.dailyActiveClients') }}</h2>
        <TimeChart :timeSeries="[
            { label: $t('dashboard.activeClients'), data: props.historyData.activeClients },
            { label: $t('dashboard.totalClients'), data: props.historyData.totalClients }
        ]" :label="$t('dashboard.dailyActiveClients')" :options="options" />
    </div>
</template>