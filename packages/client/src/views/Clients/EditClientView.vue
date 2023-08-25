<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import { hasPermission } from '@/lib/permission';
import request, { assertNotErrorResponse, isErrorResponse } from '@/lib/request';
import { formatDate } from '@/lib/utils';
import router from '@/router';
import type { ApiClient } from '@/types/client';
import type { ApiClientLog } from '@/types/clientLog';
import type { ApiTask } from '@/types/task';
import { ref } from 'vue';

const { clientId } = router.currentRoute.value.params;
const client = await request.$get<ApiClient>(`clients/${clientId}`);
const tasks = await request.$get<ApiTask[]>(`clients/${clientId}/tasks`);
const logs = await request.$get<ApiClientLog[]>(`clients/${clientId}/logs`);
assertNotErrorResponse<ApiClient>(client);
assertNotErrorResponse<ApiTask[]>(tasks);
assertNotErrorResponse<ApiClientLog[]>(logs);

const errors = ref<{
    general: string,
}>({
    general: '',
});

const clearError = () => {
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
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1>Edit Client</h1>
        </div>
        <div class="column is-half">
            <div class="field">
                <label class="label" for="">Username</label>
                <input type="text" class="input" v-model="client.username" disabled>
            </div>

            <div class="field">
                <label class="label" for="">Host Name</label>
                <input type="text" class="input" v-model="client.hostname" disabled>
            </div>

            <div class="field">
                <label class="label" for="">OS Version</label>
                <input type="text" class="input" v-model="client.os" disabled>
            </div>

            <div class="field">
                <label class="label" for="">App Version</label>
                <input type="text" class="input" v-model="client.appVersion" disabled>
            </div>
        </div>
        <div class="column is-half">
            <div class="field">
                <nav class="panel">
                    <div class="panel-heading is-flex is-align-items-center is-justify-content-space-between">
                        Tasks
                    </div>
                    <a class="panel-block" v-for="task in tasks" :key="task.id" @click="$router.push(`/tasks/${task.id}`)">
                        <div class="control is-expanded">
                            (Configuration: {{ task.configuration.name }}) {{ task.name }}
                        </div>
                    </a>
                </nav>
            </div>
        </div>

        <div class="column is-full">
            <div class="field is-grouped">
                <table class="table is-striped">
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Message</th>
                            <th>Timestamp</th>
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

        <div class="field">
            <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
        </div>
        <div class="column is-full">
            <div class="field is-grouped">
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">Cancel</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteClient()"
                        v-if="hasPermission(undefined, 'delete:client')">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>