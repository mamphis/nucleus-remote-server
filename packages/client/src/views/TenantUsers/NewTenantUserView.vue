<script setup lang="ts">
import router from '@/router';
import type { ApiUser } from '@/types/user';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';

const username = ref('');
const email = ref('');

const errors = ref<{
    username: string,
    email: string,
    general: string,
}>({
    username: '',
    email: '',
    general: '',
});

const clearError = () => {
    errors.value.username = '';
    errors.value.email = '';
    errors.value.general = '';
}

const checkUsername = async (username: string) => {
    clearError();
    if (username === '') return;

    const response = await request.$get<ApiUser>(`tenant-users/${username}`);
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
    if (username.value && email.value) {
        const response = await request.$post<ApiUser>(`tenant-users`, { username: username.value, email: email.value });

        clearError();
        if (isValidationError(response)) {
            response.data.forEach(issue => {
                switch (issue.validation) {
                    case 'email':
                        errors.value.email = issue.message;
                        break;
                    case 'username':
                        errors.value.username = issue.message;
                        break;
                }
            });
        } else if (isErrorResponse(response)) {
            errors.value.general = response.message;
        } else {
            router.push(`/tenant-users/${response.id}`);
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