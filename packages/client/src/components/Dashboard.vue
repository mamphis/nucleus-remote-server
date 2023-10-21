<script setup lang="ts">
import request from '@/lib/request';
import Badge from './DashboardComponents/Badge.vue';
import DailyActiveClients from './DashboardComponents/DailyActiveClients.vue';
import type { ApiDashboardData } from '@/types/dashboard';
import OsDistributions from './DashboardComponents/OsDistributions.vue';

const dashboardResponse = await request.$get<ApiDashboardData>('dashboard')
const dashboardData = dashboardResponse.assertNotError().toRef();

</script>


<template>
    <div class="dashboard-container is-h-100">
        <DailyActiveClients :historyData="dashboardData.historyData" />
        <Badge :label="$t('dashboard.tenantStatistics')"
            :subText="`${dashboardData.tenantStatistics.activeClients} / ${dashboardData.tenantStatistics.clientCount} / ${dashboardData.tenantStatistics.maxClients}`" />
        <OsDistributions :osDistribution="dashboardData.osDistribution" />
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-evenly;
    flex-wrap: wrap;
}

.dashboard-container>div {
    margin: 1rem;
    flex: 1 auto;
    width: 30%;
}

@media screen and (max-width: 1024px) {
    .dashboard-container>div {
        width: 100%;
    }
    
}
</style>