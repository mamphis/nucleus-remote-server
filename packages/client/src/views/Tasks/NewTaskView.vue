<script setup lang="ts">
import router from '@/router';
import { outputTypes, type OutputType, type ApiTask } from '@/types/task';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';
import { typeMap } from './tasks';

const { configurationId } = router.currentRoute.value.params;

const name = ref('');
const type = ref('');
const output = ref<OutputType>('All');

const errors = ref({
    name: '',
    type: '',
    general: '',
    output: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.type = '';
    errors.value.general = '';
    errors.value.output = '';
}

const createNewTask = async () => {
    if (name.value && type.value) {
        const response = await request.$post<ApiTask>(`tasks`, {
            name: name.value,
            type: type.value,
            configurationId,
            output: output.value,
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
            router.replace(`/tasks/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('newTask.createNewTask') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewTask()" class="column is-half">
                <div class="field">
                    <label class="label">{{ $t('field.name') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" placeholder="Name"
                            v-model="name" required>
                    </div>
                    <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
                </div>
                <div class="field">
                    <label class="label" for="">{{ $t('field.type') }}</label>
                    <span class="select">
                        <select v-model="type">
                            <option v-for="(option, key) in typeMap" :value="key" :key="key">{{ option.label }}</option>
                        </select>
                    </span>
                    <p v-if="!!errors.type" class="help is-danger">{{ errors.type }}</p>
                </div>
                <div class="field">
                    <label class="label" for="">{{ $t('field.output') }}</label>
                    <span class="select">
                        <select v-model="output">
                            <option v-for="(option) in outputTypes" :value="option" :key="option">{{ $t('task.outputType.' +
                                option) }}</option>
                        </select>
                    </span>
                    <p v-if="!!errors.output" class="help is-danger">{{ errors.output }}</p>
                </div>
                <div class="field">
                    <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <button type="submit" class="button is-link">{{ $t('button.submit') }}</button>
                    </div>
                    <div class="control">
                        <button type="reset" class="button is-link is-light" @click="$router.back()">
                            {{ $t('button.cancel') }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>