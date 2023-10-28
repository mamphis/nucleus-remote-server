<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiTenant } from '@/types/tenant';
import request, { isErrorResponse } from '../../lib/request';
import AdvancedTable from '@/components/AdvancedTable.vue';

const { user } = userStore();
const tenantResponse = await request.$get<ApiTenant[]>('tenants');
const tenants = tenantResponse.assertNotError().toRef();
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
            <AdvancedTable :data="tenants" :columns="[
                { key: 'name', label: $t('field.name'), sortable: true, searchable: true },
                { key: 'user.[number].length', label: $t('field.userCount'), sortable: true, searchable: true },
                { key: 'maxClients', label: $t('field.maxClients'), sortable: true, searchable: true },
                { key: 'client.[number].length', label: $t('field.currentClients'), sortable: true, searchable: true, data: (tenant: ApiTenant) => `${tenant.client.filter(c => c.active).length} / ${tenant.client.length}` },
            ]" :options="{ search: true, click: true }" @click="(tenant) => $router.push(`/tenants/${tenant.id}`)" />
        </div>
    </div>
</template>