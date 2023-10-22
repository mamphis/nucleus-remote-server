<script setup lang="ts">
import { ref } from 'vue';
import MetricsView from './MetricsView.vue';
import StatisticsView from './StatisticsView.vue';
import RequestsView from './RequestMetricsView.vue';

const activeTab = ref('metrics');
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="title">{{ $t('admin.admin') }}</h1>
        </div>
        <div class="column is-full">
            <div class="tabs">
                <ul>
                    <li :class="{ 'is-active': activeTab == 'metrics' }"><a @click.prevent="activeTab = 'metrics'">{{
                        $t('admin.tabs.metrics') }}</a></li>
                    <li :class="{ 'is-active': activeTab == 'statistics' }"><a @click.prevent="activeTab = 'statistics'">{{
                        $t('admin.tabs.statistics') }}</a></li>
                    <li :class="{ 'is-active': activeTab == 'requests' }"><a @click.prevent="activeTab = 'requests'">{{
                        $t('admin.tabs.requests') }}</a></li>
                </ul>
            </div>
            <MetricsView v-if="activeTab == 'metrics'"></MetricsView>
            <StatisticsView v-if="activeTab == 'statistics'"></StatisticsView>
            <RequestsView v-if="activeTab == 'requests'"></RequestsView>
        </div>
    </div>
</template>