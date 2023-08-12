<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import request, { isErrorResponse } from '@/lib/request';
import router from '@/router';
import type { ApiUser } from '@/types/user';

const { userId } = router.currentRoute.value.params;
const user = await request.$get<ApiUser>(`users/${userId}`);

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
    <div>Edit User</div>
    <div>{{ userId }}</div>
    <div v-if="!isErrorResponse(user)">
        <div>{{ user.username }}</div>
        <div>{{ user.tenant.name }}</div>
        <div>
            <Permission v-for="permission in permissions" :key="permission" :user="user" :permission="permission" />
        </div>
    </div>
</template>