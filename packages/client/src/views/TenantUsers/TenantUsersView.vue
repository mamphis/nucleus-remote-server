<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiUser } from '@/types/user';
import request, { isErrorResponse } from '../../lib/request';

const { user } = userStore();
const users = await request.$get<ApiUser[]>('tenant-users');
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>{{ $t('users.users') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:tenant-user')"
                    @click="$router.push('/new-tenant-user')">
                    {{ $t('users.newUser') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <table class="table">
                <thead>
                    <tr>
                        <th>{{ $t('field.username') }}</th>
                        <th>{{ $t('field.eMail') }}</th>
                        <th>{{ $t('field.tenant') }}</th>
                        <th>{{ $t('field.permissionCount') }}</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(users)">
                    <tr v-for="user in users" :key="user.id" class="is-clickable"
                        @click="$router.push(`/tenant-users/${user.id}`)">
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.tenant.name }}</td>
                        <td>{{ user.permission.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>