<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import { hasPermission } from '@/lib/permission';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import { formatDate } from '@/lib/utils';
import router from '@/router';
import type { ApiClient } from '@/types/client';
import type { ApiClientLog } from '@/types/clientLog';
import type { ApiTask } from '@/types/task';
import { ref } from 'vue';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { clientId } = router.currentRoute.value.params;
const response = await request.$get<ApiClient>(`clients/${clientId}`);
const tasks = await request.$get<ApiTask[]>(`clients/${clientId}/tasks`);
const logs = await request.$get<ApiClientLog[]>(`clients/${clientId}/logs`);
assertNotErrorResponse<ApiTask[]>(tasks);
assertNotErrorResponse<ApiClientLog[]>(logs);
const client = response.assertNotError().toRef();

const errors = ref({
    active: '',
    general: '',
});

const clearError = () => {
    errors.value.active = '';
    errors.value.general = '';
}

const deleteClient = async () => {
    clearError();
    const response = await request.$delete(`clients/${clientId}`);
    if (!isErrorResponse(response)) {
        router.back();
    }

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    }
}

const updateClient = async () => {
    clearError();
    const response = await request.$patch<ApiClient>(`clients/${client.value.id}`, {
        active: client.value.active,
    });

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
        sendNotification('success', $t('editClient.updateSuccessful'));
    }
};
</script>

<template>
    <form @submit.prevent="updateClient()" class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1>{{ $t('editClient.editClient') }}</h1>
        </div>
        <div class="column is-half">
            <div class="field">
                <label class="label" for="">{{ $t('field.username') }}</label>
                <input type="text" class="input" v-model="client.username" disabled>
            </div>

            <div class="field">
                <label class="label" for="">{{ $t('field.hostname') }}</label>
                <input type="text" class="input" v-model="client.hostname" disabled>
            </div>

            <div class="field">
                <label class="label" for="">{{ $t('field.osVersion') }}</label>
                <input type="text" class="input" v-model="client.os" disabled>
            </div>

            <div class="field">
                <label class="label" for="">{{ $t('field.appVersion') }}</label>
                <input type="text" class="input" v-model="client.appVersion" disabled>
            </div>

            <div class="field">
                <label class="checkbox" for="" :class="{ 'is-danger': !!errors.active }">
                    <input class="checkbox" type="checkbox" v-model="client.active" />
                    {{ $t('field.active') }}
                </label>
                <p v-if="!!errors.active" class="help is-danger">{{ errors.active }}</p>
            </div>
        </div>
        <div class="column is-half">
            <div class="field">
                <nav class="panel">
                    <div class="panel-heading is-flex is-align-items-center is-justify-content-space-between">
                        {{ $t('field.tasks') }}
                    </div>
                    <a class="panel-block" v-for="task in tasks" :key="task.id" @click="$router.push(`/tasks/${task.id}`)">
                        <div class="control is-expanded">
                            <input :checked="task?.active" type="checkbox" class="checkbox" disabled /> {{
                                $t('editClient.taskList', task.configuration.name, task.name) }}
                        </div>
                    </a>
                </nav>
            </div>
        </div>

        <div class="field">
            <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
        </div>
        <div class="column is-full">
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:client')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteClient()"
                        v-if="hasPermission(undefined, 'delete:client') && false /** TODO #9 */">{{ $t('button.delete')
                        }}</button>
                </div>
            </div>
        </div>
        <div class="column is-full">
            <div class="field is-grouped">
                <table class="table is-striped">
                    <thead>
                        <tr>
                            <th>{{ $t('field.level') }}</th>
                            <th>{{ $t('field.message') }}</th>
                            <th>{{ $t('field.timestamp') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in logs" :key="log.id">
                            <td>{{ log.level }}</td>
                            <td>{{ log.message }}</td>
                            <td>{{ formatDate(log.timestamp) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </form>
</template>

<style scoped></style>