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
                <h1>Tenants</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:tenant')" @click="$router.push('/new-tenant')">New
                    Tenant</button>
            </div>
        </div>
        <div class="column is-full">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Users</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(tenants)">
                    <tr v-for="tenant in tenants" :key="tenant.id" class="is-clickable"
                        @click="$router.push(`/tenants/${tenant.id}`)">
                        <td>{{ tenant.name }}</td>
                        <td>{{ tenant.user.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>