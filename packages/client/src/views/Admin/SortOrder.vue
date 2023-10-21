<script setup lang="ts">
import type { SortKey, SortOrder } from '@/types/metrics';

const { sortOrder, metric } = defineProps<{
    sortOrder: SortOrder<any>,
    metric: SortKey<any>,
}>();

</script>

<template>
    <span v-if="sortOrder[0] === metric">
        <span v-if="sortOrder[1] === 'asc'">▲▽</span>
        <span v-if="sortOrder[1] === 'desc'">△▼</span>
    </span>
    <span v-else>△▽</span>
</template>

