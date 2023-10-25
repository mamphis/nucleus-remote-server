<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiTenant } from '@/types/tenant';
import request, { isErrorResponse } from '../../lib/request';

const { user } = userStore();
const tenants = await request.$get<ApiTenant[]>('tenants');
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('tenants.tenants') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:tenant')" @click="$router.push('/tenants/new')">
                    {{ $t('tenants.newTenant') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>{{ $t('field.name') }}</th>
                        <th>{{ $t('field.userCount') }}</th>
                        <th>{{ $t('field.maxClients') }}</th>
                        <th>{{ $t('field.currentClients') }}</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(tenants)">
                    <tr v-for="tenant in tenants" :key="tenant.id" class="is-clickable"
                        @click="$router.push(`/tenants/${tenant.id}`)">
                        <td>{{ tenant.name }}</td>
                        <td>{{ tenant.user.length }}</td>
                        <td>{{ tenant.maxClients }}</td>
                        <td>{{ tenant.client.filter(c => c.active).length }} / {{ tenant.client.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>