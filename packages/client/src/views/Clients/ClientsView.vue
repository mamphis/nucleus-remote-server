<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import request, { isErrorResponse } from '@/lib/request';
import { formatDate, humanizeDate } from '@/lib/utils';
import { settingsStore } from '@/stores/settings';
import userStore from '@/stores/user';
import type { ApiClient } from '@/types/client';
import type { ApiTenant } from '@/types/tenant';

const clientResponse = await request.$get<ApiClient[]>('clients');
const clients = clientResponse.assertNotError().toRef();
const { baseApiUrl } = settingsStore();
const { user } = userStore();
const tenantResponse = await request.$get<Pick<ApiTenant, 'maxClients'>>(`tenants/${user?.tenantId}`);
const tenant = tenantResponse.assertNotError();
const fileUrl = new URL(`/system/update/file`, baseApiUrl).href;

const downloadConfigurationFile = async () => {
    const response = await request.$raw('GET', 'clients/configuration');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appsettings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    const clientResponse = await request.$get<ApiClient[]>('clients');
    clients.value = clientResponse.assertNotError();
};

</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('clients.clients') }}</h1>
                <h6 class="subtitle">{{ $t('clients.maxConcurrentClients', tenant.maxClients) }}</h6>
            </div>
            <div class="column is-flex is-justify-content-end">
                <div class="buttons is-grouped">
                    <a class="button" v-if="hasPermission(user, 'create:client')"
                        @click.preventDefault="downloadConfigurationFile()">
                        {{ $t('clients.newClient') }}</a>
                    <a class="button" v-if="hasPermission(user, 'create:client')" :href="fileUrl">
                        {{ $t('clients.downloadClient') }}</a>
                </div>
            </div>
        </div>
        <div class="column is-full">
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>{{ $t('field.active') }}</th>
                        <th>{{ $t('field.username') }}</th>
                        <th>{{ $t('field.hostname') }}</th>
                        <th>{{ $t('field.osVersion') }}</th>
                        <th>{{ $t('field.appVersion') }}</th>
                        <th>{{ $t('field.lastPing') }}</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(clients)">
                    <tr v-for="client in clients" :key="client.id" class="is-clickable"
                        @click="$router.push(`/clients/${client.id}`)">
                        <td><input type="checkbox" :checked="client.active" disabled></td>
                        <td>{{ client.username }}</td>
                        <td>{{ client.hostname }}</td>
                        <td>{{ client.os }}</td>
                        <td>{{ client.appVersion }}</td>
                        <td>{{ formatDate(client.lastPing) }} ({{ humanizeDate(client.lastPing) }})</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>