<script setup lang="ts">
import request, { isErrorResponse } from '@/lib/request';
import { formatDate,humanizeDate } from '@/lib/utils';
import type { ApiClient } from '@/types/client';

const clients = await request.$get<ApiClient[]>('clients');
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Clients</h1>
            </div>
        </div>
        <div class="column is-full">
            <table class="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Hostname</th>
                        <th>OS Version</th>
                        <th>App Version</th>
                        <th>Last Connection</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(clients)">
                    <tr v-for="client in clients" :key="client.id" class="is-clickable"
                        @click="$router.push(`/clients/${client.id}`)">
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