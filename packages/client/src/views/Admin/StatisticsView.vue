<script setup lang="ts">
import request from '@/lib/request';
import Badge from '@/components/DashboardComponents/Badge.vue';
import type { ApiStatistics, StatisticValue } from '@/types/metrics';
import { computed } from 'vue';
import { humanizeFileSize } from '@/lib/utils';

const statisticsResponse = await request.$get<ApiStatistics>('admin/statistics')
const statistics = statisticsResponse.assertNotError().toRef();

// get an map of all the keys in the statistics object and the values
const statisticsMap = computed(() => {
    const map = new Map<string, string>();
    for (const [key, value] of Object.entries(statistics.value)) {
        if (typeof value === 'number') {
            map.set(key, value.toString());
            continue;
        }
        if ('formatterName' in value && 'value' in value) {
            switch (value.formatterName) {
                case 'humanizeFileSize': 
                    map.set(key, humanizeFileSize(value.value));
                    break;
            }
        }
    }
    return map;
});

</script>


<template>
    <div class="statistics-container">
        <Badge :label="$t('admin.statistics.' + key)" v-for="[key, value] in statisticsMap" :key="key"
            :subText="value" />
    </div>
</template>

<style scoped>
.statistics-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-evenly;
    flex-wrap: wrap;
}

.statistics-container>div {
    margin: 1rem;
    flex: 1 auto;
    width: 30%;
}

@media screen and (max-width: 1024px) {
    .statistics-container>div {
        width: 100%;
    }

}
</style>