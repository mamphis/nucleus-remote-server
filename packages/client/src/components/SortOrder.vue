<script setup lang="ts">
import type { SortKey, SortOrder } from '@/types/utils';

const { sortOrder, sortKey } = defineProps<{
    sortOrder: SortOrder<any, any>,
    sortKey: SortKey<any, any>,
}>();

</script>

<template>
    <span v-if="sortOrder[0] === sortKey">
        <span v-if="sortOrder[1] === 'asc'">▲▽</span>
        <span v-if="sortOrder[1] === 'desc'">△▼</span>
    </span>
    <span v-else>△▽</span>
</template>

