<script setup lang="ts">
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';

const name = ref('');
const maxClients = ref(5);

const errors = ref({
    name: '',
    maxClients: '',
    general: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.maxClients = '';
    errors.value.general = '';
}

const createNewTenant = async () => {
    if (name.value) {
        const response = await request.$post<ApiTenant>(`tenants`, {
            name: name.value,
            maxClients: maxClients.value,
        });

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
            router.replace(`/tenants/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>{{ $t('newTenant.createNewTenant') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewTenant()" class="column is-half">
                <div class="field">
                    <label class="label">{{ $t('field.name') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.name }" class="input" type="text"
                            :placeholder="$t('field.name')" v-model="name" required>
                    </div>
                    <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
                </div>

                <div class="field">
                    <label class="label">{{ $t('field.maxClients') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.maxClients }" class="input" type="number"
                            :placeholder="$t('field.maxClients')" v-model="maxClients" required>
                    </div>
                    <p v-if="!!errors.maxClients" class="help is-danger">{{ errors.maxClients }}</p>
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