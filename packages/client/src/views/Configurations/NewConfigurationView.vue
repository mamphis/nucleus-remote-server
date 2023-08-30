<script setup lang="ts">
import router from '@/router';
import type { ApiConfiguration } from '@/types/configuration';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';

const configurations = await request.$get<ApiConfiguration[]>('configurations');

const name = ref('');

const errors = ref<{
    name: string,
    general: string,
}>({
    name: '',
    general: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.general = '';
}

const createNewConfiguration = async () => {
    if (name.value) {
        const response = await request.$post<ApiConfiguration>(`configurations`, { name: name.value });

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
            router.replace(`/configurations/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>{{ $t('newConfiguration.newConfiguration') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewConfiguration()" class="column is-half">
                <div class="field">
                    <label class="label">{{ $t('field.name') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.name }" class="input" type="text"
                            :placeholder="$t('field.name')" v-model="name" required>
                    </div>
                    <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
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