<script setup lang="ts">
import type { ApiUser } from '@/types/user';
import request, { isErrorResponse } from '../../lib/request';
import type { ApiTenant } from '@/types/tenant';
import { ref } from 'vue';
import router from '@/router';

const tenants = await request.$get<ApiTenant[]>('tenants');

const username = ref('');
const tenant = ref('');

const usernameError = ref<string>();

const checkUsername = async (username: string) => {
    usernameError.value = '';
    if (username === '') return;

    const response = await request.$get<ApiUser>(`users/${username}`);
    if (!isErrorResponse(response)) {
        usernameError.value = 'This username is not available'
    } else {
        switch (response.error) {
            case 'NotFoundError':
                break;
            default:
                usernameError.value = response.message;
        }
    }
}

const createNewUser = async () => {
    if (username.value && tenant.value) {
        const response = await request.$post<ApiUser>(`users`, { username: username.value, tenant: tenant.value });

        if (isErrorResponse(response)) {
            usernameError.value = response.message;
        } else {
            router.push(`/user/${response.id}`);
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
                        <input :class="{ 'is-danger': !!usernameError }" class="input" type="text" placeholder="Username"
                            v-model="username" @blur="checkUsername(username)" required>
                    </div>
                    <p v-if="!!usernameError" class="help is-danger">{{ usernameError }}</p>
                </div>
                <div class="field">
                    <label class="label">Tenant</label>
                    <div class="control">
                        <span class="select">
                            <select v-model="tenant">
                                <option value="">Please select tenant</option>
                                <option v-if="!isErrorResponse(tenants)" v-for="tenant in tenants" :key="tenant.id">
                                    {{ tenant.name }}
                                </option>
                            </select>
                        </span>
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
            </form>
        </div>
    </div>
</template>