<script setup lang="ts">
import type { ApiUser } from '@/types/user';
import request, { isErrorResponse, isValidationError } from '../../lib/request';
import type { ApiTenant } from '@/types/tenant';
import { ref } from 'vue';
import router from '@/router';

const tenants = await request.$get<ApiTenant[]>('tenants');

const username = ref('');
const email = ref('');
const tenant = ref('');

const errors = ref<{
    username: string,
    email: string,
    tenant: string,
    general: string,
}>({
    username: '',
    email: '',
    tenant: '',
    general: '',
});

const clearError = () => {
    errors.value.username = '';
    errors.value.email = '';
    errors.value.tenant = '';
    errors.value.general = '';
}

const checkUsername = async (username: string) => {
    clearError();
    if (username === '') return;

    const response = await request.$get<ApiUser>(`users/${username}`);
    if (!isErrorResponse(response)) {
        errors.value.username = 'This username is not available'
    } else {
        switch (response.error) {
            case 'NotFoundError':
                break;
            default:
                errors.value.username = response.message;
        }
    }
}

const createNewUser = async () => {
    if (username.value && tenant.value && email.value) {
        const response = await request.$post<ApiUser>(`users`, { username: username.value, tenant: tenant.value, email: email.value });

        clearError();
        if (isValidationError(response)) {
            response.data.forEach(issue => {
                switch (issue.validation) {
                    case 'email':
                        errors.value.email = issue.message;
                        break;
                    case 'tenant':
                        errors.value.tenant = issue.message;
                        break;
                    case 'username':
                        errors.value.username = issue.message;
                        break;
                }
            });
        } else if (isErrorResponse(response)) {
            errors.value.general = response.message;
        } else {
            router.push(`/users/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Create New User</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewUser()" class="column is-half">
                <div class="field">
                    <label class="label">Username</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.username }" class="input" type="text" placeholder="Username"
                            v-model="username" @blur="checkUsername(username)" required>
                    </div>
                    <p v-if="!!errors.username" class="help is-danger">{{ errors.username }}</p>
                </div>
                <div class="field">
                    <label class="label">E-Mail</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.email }" class="input" type="email" placeholder="E-Mail"
                            v-model="email" required>
                    </div>
                    <p v-if="!!errors.email" class="help is-danger">{{ errors.email }}</p>
                </div>
                <div class="field">
                    <label class="label">Tenant</label>
                    <div class="control">
                        <span :class="{ 'is-danger': !!errors.tenant }" class="select">
                            <select v-model="tenant">
                                <option value="">Please select tenant</option>
                                <option v-if="!isErrorResponse(tenants)" v-for="tenant in tenants" :key="tenant.id"
                                    :value="tenant.id">
                                    {{ tenant.name }}
                                </option>
                            </select>
                        </span>
                    </div>
                    <p v-if="!!errors.tenant" class="help is-danger">{{ errors.tenant }}</p>
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
    </div>
</template>