<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import request, { isErrorResponse } from '@/lib/request';
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import type { ApiUser } from '@/types/user';

const { userId } = router.currentRoute.value.params;
const user = await request.$get<ApiUser>(`users/${userId}`);
const tenants = await request.$get<ApiTenant[]>('tenants');

const permissions = [
    'tenant',
    'user',
    'tenant-user',
    'client',
    'group',
    'configuration',
    'task',
];
</script>

<template>
    <div class="columns is-multiline">
        <div class="column is-full">
            <h1>Edit User</h1>
        </div>
        <div class="column is-full" v-if="!isErrorResponse(user)">
            <div class="field">
                <label class="label" for="">Username</label>
                <input type="text" v-model="user.username" disabled>
            </div>
            <div class="field">
                <label class="label" for="">Tenant</label>
                <span class="select">
                    <select v-model="user.tenant.id">
                        <option v-if="!isErrorResponse(tenants)" v-for="tenant in tenants" :key="tenant.id"
                            :value="tenant.id">
                            {{ tenant.name }}
                        </option>
                    </select>
                </span>
            </div>
            <div class="field">
                <h2>Permissions</h2>
                <div class="columns is-multiline">
                    <div class="column is-one-third" v-for="permission in permissions" :key="permission">
                        <Permission :user="user" :permission="permission" />
                    </div>
                </div>
            </div>

            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link">Submit</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>