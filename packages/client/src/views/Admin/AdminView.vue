<script setup lang="ts">
import { ref } from 'vue';
import SqlMetricsView from './SqlMetricsView.vue';
import StatisticsView from './StatisticsView.vue';
import RequestsView from './RequestMetricsView.vue';
const defaultTab = location.hash == '' ? 'metrics' : location.hash.substring(1);
const activeTab = ref(defaultTab);

const setActiveTab = (tab: string) => {
    activeTab.value = tab;
    location.hash = tab;
};
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100" style="width: 100%;">
        <div class="column is-full">
            <h1 class="title">{{ $t('admin.admin') }}</h1>
        </div>
        <div class="column is-full">
            <div class="tabs">
                <ul>
                    <li :class="{ 'is-active': activeTab == 'metrics' }"><a @click.prevent="setActiveTab('metrics')">{{
                        $t('admin.tabs.metrics') }}</a></li>
                    <li :class="{ 'is-active': activeTab == 'statistics' }"><a
                            @click.prevent="setActiveTab('statistics')">{{
                                $t('admin.tabs.statistics') }}</a></li>
                    <li :class="{ 'is-active': activeTab == 'requests' }"><a @click.prevent="setActiveTab('requests')">{{
                        $t('admin.tabs.requests') }}</a></li>
                </ul>
            </div>
            <div class="is-flex is-flex-direction-column">
                <SqlMetricsView v-if="activeTab == 'metrics'"></SqlMetricsView>
                <StatisticsView v-if="activeTab == 'statistics'"></StatisticsView>
                <RequestsView v-if="activeTab == 'requests'"></RequestsView>
            </div>
        </div>
    </div>
</template>