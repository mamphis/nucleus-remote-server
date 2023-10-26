<script setup lang="ts">
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import router from '@/router';
import { outputTypes, type OutputType, type ApiTask } from '@/types/task';
import { ref } from 'vue';
import { typeMap } from './tasks';
import { hasPermission } from '@/lib/permission';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { taskId } = router.currentRoute.value.params;

const task = await request.$get<ApiTask>(`tasks/${taskId}`);
assertNotErrorResponse<ApiTask>(task);

const name = ref(task.name);
const type = ref(task.type);
const content = ref(task.content);
const active = ref(task.active);
const runOnce = ref(task.runOnce);
const output = ref(task.output);

const errors = ref({
    name: '',
    type: '',
    content: '',
    general: '',
    active: '',
    runOnce: '',
    output: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.type = '';
    errors.value.content = '';
    errors.value.active = '';
    errors.value.runOnce = '';
    errors.value.general = '';
}

const updateTask = async () => {
    if (name.value && type.value) {
        const response = await request.$patch<ApiTask>(`tasks/${taskId}`, {
            name: name.value,
            content: content.value,
            active: active.value,
            runOnce: runOnce.value,
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
            sendNotification('success', $t('editTask.updateSuccessful'));
        }
    }
}

const deleteTask = async () => {
    clearError();
    const response = await request.$delete(`tasks/${taskId}`);
    if (!isErrorResponse(response)) {
        router.back();
    }

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('editTask.editTask') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="updateTask()" class="column is-full">
                <div class="columns is-multiline">
                    <div class="column is-half">
                        <div class="field">
                            <label class="label">{{ $t('field.name') }}</label>
                            <div class="control">
                                <input :class="{ 'is-danger': !!errors.name }" class="input is-expanded" type="text"
                                    placeholder="Name" v-model="name" required>
                            </div>
                            <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
                        </div>
                        <div class="field is-horizontal">
                            <div class="field-body">
                                <div class="field">
                                    <label class="label" for="">{{ $t('field.type') }}</label>
                                    <span class="select">
                                        <select v-model="type" disabled>
                                            <option v-for="(option, key) in typeMap" :value="key" :key="key">{{ option.label
                                            }}
                                            </option>
                                        </select>
                                    </span>
                                </div>
                                <div class="field">
                                    <label class="label" for="">{{ $t('field.output') }}</label>
                                    <span class="select">
                                        <select v-model="output">
                                            <option v-for="(option) in outputTypes" :value="option" :key="option">
                                                {{ $t('task.outputType.' + option) }}
                                            </option>
                                        </select>
                                    </span>
                                    <p v-if="!!errors.output" class="help is-danger">{{ errors.output }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="column is-half">
                        <div class="field">
                            <div class="control">
                                <label class="checkbox" for="">
                                    <input class="checkbox" type="checkbox" v-model="active" />
                                    {{ $t('field.active') }}
                                </label>
                            </div>
                            <p v-if="!!errors.active" class="help is-danger">{{ errors.active }}</p>
                        </div>

                        <div class="field">
                            <div class="control">
                                <label class="checkbox" for="">
                                    <input class="checkbox" type="checkbox" v-model="runOnce" />
                                    {{ $t('field.runOnce') }}
                                </label>
                            </div>
                            <p v-if="!!errors.runOnce" class="help is-danger">{{ errors.runOnce }}</p>
                        </div>
                    </div>



                    <div class="column is-full">
                        <component :is="typeMap[type].component" v-model="content"></component>
                    </div>

                    <div class="field column is-full">
                        <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
                    </div>
                    <div class="field is-grouped">
                        <div class="control">
                            <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:task')">{{
                                $t('button.submit') }}</button>
                        </div>
                        <div class="control">
                            <button type="reset" class="button is-link is-light" @click="$router.back()">{{
                                $t('button.cancel')
                            }}</button>
                        </div>
                        <div class="control">
                            <button type="button" class="button is-danger is-light" @click="deleteTask()"
                                v-if="hasPermission(undefined, 'delete:task') && false /** TODO #10 */">{{
                                    $t('button.delete')
                                }}</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
