<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiUser } from '@/types/user';
import request, { isErrorResponse } from '../../lib/request';
import AdvancedTable from '@/components/AdvancedTable.vue';

const { user } = userStore();
const userResponse = await request.$get<ApiUser[]>('tenant-users');
const users = userResponse.assertNotError().toRef();
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('users.users') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:tenant-user')"
                    @click="$router.push('/tenant-users/new')">
                    {{ $t('users.newUser') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <AdvancedTable :data="users" :columns="[
                { key: 'username', label: $t('field.username'), sortable: true, searchable: true },
                { key: 'email', label: $t('field.eMail'), sortable: true, searchable: true },
                { key: 'tenant.name', label: $t('field.tenant'), sortable: true, searchable: true },
                { key: 'permission.[number].length', label: $t('field.permissionCount'), sortable: true },
            ]" :options="{ click: true, search: true }"
                @click="(user) => $router.push(`/tenant-users/${user.id}`)" :additional-sort-keys="['table']" />
        </div>
    </div>
</template>