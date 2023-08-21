<script setup lang="ts">
import router from '@/router';
import type { ApiTask } from '@/types/task';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';
import { typeMap } from './tasks';

const { configurationId } = router.currentRoute.value.params;

const name = ref('');
const type = ref('');

const errors = ref<{
    name: string,
    type: string,
    general: string,
}>({
    name: '',
    type: '',
    general: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.type = '';
    errors.value.general = '';
}

const createNewTask = async () => {
    if (name.value && type.value) {
        const response = await request.$post<ApiTask>(`tasks`, { name: name.value, type: type.value, configurationId });

        clearError();
        if (isValidationError(response)) {
            response.data.forEach(issue => {
                switch (issue.validation) {
                    case 'name':
                        errors.value.name = issue.message;
                        break;
                    case 'type':
                        errors.value.type = issue.message;
                        break;
                }
            });
        } else if (isErrorResponse(response)) {
            errors.value.general = response.message;
        } else {
            router.push(`/tasks/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Create New Task</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewTask()" class="column is-half">
                <div class="field">
                    <label class="label">Name</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" placeholder="Name"
                            v-model="name" required>
                    </div>
                    <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
                </div>
                <div class="field">
                    <label class="label" for="">Type</label>
                    <span class="select">
                        <select v-model="type">
                            <option v-for="(option, key) in typeMap" :value="key" :key="key">{{ option.label }}</option>
                        </select>
                    </span>
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