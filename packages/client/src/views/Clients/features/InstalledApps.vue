<script setup lang="ts">
import { $t } from '@/lib/locale/locale';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import { formatDate } from '@/lib/utils';
import router from '@/router';
import type { ApiInstalledApp } from '@/types/installedApp';
import { ref } from 'vue';
import { computed } from 'vue';

const { clientId } = router.currentRoute.value.params;
const appResponse = await request.$get<ApiInstalledApp[]>(`clients/${clientId}/installedApps`);
const allApps = appResponse.assertNotError();
const searchValue = ref('');

const apps = computed(() => {
    return allApps.filter(app => {
        return app.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
            app.publisher.toLowerCase().includes(searchValue.value.toLowerCase());
    })
});
</script>

<template>
    <div class="column is-full">
        <h1 class="title">{{ $t('editClient.feature.installedApps') }}</h1>
    </div>

    <div class="column is-full">
        <div class="field">
            <input type="text" class="input" :placeholder="$t('editClient.feature.installedApps.searchPlaceholder')"
                v-model="searchValue">
        </div>
        <table class="table is-striped is-fullwidth">
            <thead>
                <tr>
                    <th>{{ $t('field.name') }}</th>
                    <th>{{ $t('field.version') }}</th>
                    <th>{{ $t('field.publisher') }}</th>
                    <th>{{ $t('field.installDate') }}</th>
                    <th>{{ $t('field.lastUpdate') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="app in apps" :key="app.name">
                    <td>{{ app.name }}</td>
                    <td>{{ app.version }}</td>
                    <td>{{ app.publisher }}</td>
                    <td>{{ formatDate(app.installDate) }}</td>
                    <td>{{ formatDate(app.lastUpdate) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>