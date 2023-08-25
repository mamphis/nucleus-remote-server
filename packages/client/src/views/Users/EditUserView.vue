<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import request, { isErrorResponse } from '@/lib/request';
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import type { ApiUser } from '@/types/user';
import { ref } from 'vue';

const { userId } = router.currentRoute.value.params;
const user = await request.$get<ApiUser>(`users/${userId}`);
const tenants = await request.$get<ApiTenant[]>('tenants');

const errors = ref<{
    general: string,
}>({
    general: '',
});

const clearError = () => {
    errors.value.general = '';
}

const updateUser = async (user: ApiUser) => {
    clearError();

    const response = await request.$patch<ApiUser>(`users/${userId}`, {
        tenant: user.tenant.id,
        email: user.email,
    });

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    }
}

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
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1>Edit User</h1>
        </div>
        <form @submit.prevent="updateUser(user);" class="column is-full" v-if="!isErrorResponse(user)">
            <div class="field">
                <label class="label" for="">Username</label>
                <input type="text" class="input" v-model="user.username" disabled>
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
                <label class="label" for="">E-Mail</label>
                <input type="email" class="input" v-model="user.email">
            </div>
            <div class="field">
                <h2>Permissions</h2>
                <div class="columns is-multiline">
                    <div class="column is-narrow" v-for="permission in permissions" :key="permission">
                        <Permission scope="user" :user="user" :permission="permission" />
                    </div>
                </div>
            </div>
            <div class="field">
                <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link">Submit</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">Cancel</button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.column {
    margin-right: 50px;
}
</style>