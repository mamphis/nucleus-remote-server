<script setup lang="ts">
import router from '@/router';
import type { ApiConfiguration } from '@/types/configuration';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';

const { configurationId } = router.currentRoute.value.params;
const configuration = await request.$get<ApiConfiguration>(`configurations/${configurationId}`);

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

const updateConfiguration = async (configuration: ApiConfiguration) => {
    if (configuration.name) {
        const response = await request.$patch<ApiConfiguration>(`configurations/${configurationId}`, { name: configuration.name });

        clearError();
        if (isValidationError(response)) {
            response.data.forEach(issue => {
                switch (issue.validation) {
                    case 'name':
                        errors.value.name = issue.message;
                        break;
                }
            });
        } else if (isErrorResponse(response)) {
            errors.value.general = response.message;
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Edit configuration</h1>
            </div>
        </div>
        <form @submit.prevent="updateConfiguration(configuration)" class="column is-full"
            v-if="!isErrorResponse(configuration)">
            <div class="field">
                <label class="label">Name</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" placeholder="Name"
                        v-model="configuration.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
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