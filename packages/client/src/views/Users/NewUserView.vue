<script setup lang="ts">
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import type { ApiUser } from '@/types/user';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';
import { $t } from '@/lib/locale/locale';

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
        errors.value.username = $t('newUser.usernameNotAvailable', username);
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
                if (issue.path in errors.value) {
                    errors.value[issue.path as keyof typeof errors.value] = issue.message;
                } else {
                    errors.value.general = issue.message;
                }
            });
        } else if (isErrorResponse(response)) {
            errors.value.general = response.message;
        } else {
            router.replace(`/users/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('newUser.createNewUser') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewUser()" class="column is-half">
                <div class="field">
                    <label class="label">{{ $t('field.username') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.username }" class="input" type="text"
                            :placeholder="$t('field.username')" v-model="username" @blur="checkUsername(username)" required>
                    </div>
                    <p v-if="!!errors.username" class="help is-danger">{{ errors.username }}</p>
                </div>
                <div class="field">
                    <label class="label">{{ $t('field.eMail') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.email }" class="input" type="email"
                            :placeholder="$t('field.eMail')" v-model="email" required>
                    </div>
                    <p v-if="!!errors.email" class="help is-danger">{{ errors.email }}</p>
                </div>
                <div class="field">
                    <label class="label">{{ $t('field.tenant') }}</label>
                    <div class="control">
                        <span :class="{ 'is-danger': !!errors.tenant }" class="select">
                            <select v-model="tenant">
                                <option value="">{{ $t('newUser.selectTenant') }}</option>
                                <option v-if="!isErrorResponse(tenants)" v-for=" tenant  in  tenants " :key="tenant.id"
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
                        <button type="submit" class="button is-link">{{ $t('button.submit') }}</button>
                    </div>
                    <div class="control">
                        <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                        }}</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>