<script setup lang="ts">
import { $t } from '@/lib/locale/locale';
import { hasPermission } from '@/lib/permission';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import { formatDate } from '@/lib/utils';
import router from '@/router';
import { eventStore } from '@/stores/eventBus';
import type { ApiClient } from '@/types/client';
import type { ApiClientDetail } from '@/types/clientDetail';
import type { ApiClientLog } from '@/types/clientLog';
import type { ApiFeatureFlag } from '@/types/featureFlag';
import type { ApiTask } from '@/types/task';
import { ref } from 'vue';
import InstalledApps from './features/InstalledApps.vue';
import LocalDrives from './features/LocalDrives.vue';

const defaultTab = location.hash == '' ? 'dashboard' : location.hash.substring(1);
const activeTab = ref(defaultTab);

const { sendNotification } = eventStore();

const { clientId } = router.currentRoute.value.params;
const response = await request.$get<ApiClient>(`clients/${clientId}`);
const tasks = await request.$get<ApiTask[]>(`clients/${clientId}/tasks`);
const logsResponse = await request.$get<ApiClientLog[]>(`clients/${clientId}/logs`);
const details = await request.$get<ApiClientDetail[]>(`clients/${clientId}/details`);
assertNotErrorResponse<ApiTask[]>(tasks);
assertNotErrorResponse<ApiClientDetail[]>(details);

const logs = logsResponse.assertNotError().toRef();
const client = response.assertNotError().toRef();
const featuresResponse = await request.$get<ApiFeatureFlag[]>(`tenants/${client.value.tenantId}/features`);
const features = featuresResponse.assertNotError().toRef();

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

const reloadLogs = async () => {
    logs.value = (await request.$get<ApiClientLog[]>(`clients/${clientId}/logs`)).assertNotError();
}

const setActiveTab = (tab: string) => {
    activeTab.value = tab;
    location.hash = tab;
};
</script>

<template>
    <div class="columns client-container">
        <div class="column is-2">
            <aside class="menu">
                <p class="menu-label">
                    {{ $t('editClient.nav.general') }}
                </p>

                <ul class="menu-list">
                    <li>
                        <a :class="{ 'is-active': activeTab == 'dashboard' }" @click.prevent="setActiveTab('dashboard')">{{
                            $t('editClient.nav.dashboard') }}</a>
                    </li>
                    <li>
                        <a :class="{ 'is-active': activeTab == 'logs' }" @click.prevent="setActiveTab('logs')">{{
                            $t('editClient.nav.logs') }}</a>
                    </li>
                </ul>
                <p class="menu-label" v-if="features.some(f => f.enabled)">
                    {{ $t('editClient.nav.features') }}
                </p>

                <ul class="menu-list">
                    <li>
                        <a v-if="features.find(f => f.id == 'f-1.0.8-installed_apps')?.enabled ?? false"
                            :class="{ 'is-active': activeTab == 'f-1.0.8-installed_apps' }"
                            @click.prevent="setActiveTab('f-1.0.8-installed_apps')">{{ $t('editClient.nav.installedApps') }}</a>
                    </li>
                    <li>
                        <a v-if="features.find(f => f.id == 'f-1.0.12-drive_monitor')?.enabled ?? false"
                            :class="{ 'is-active': activeTab == 'f-1.0.12-drive_monitor' }"
                            @click.prevent="setActiveTab('f-1.0.12-drive_monitor')">{{ $t('editClient.nav.driveMonitor') }}</a>
                    </li>
                </ul>
            </aside>
        </div>
        <div class="column content-container">
            <form v-if="activeTab == 'dashboard'" @submit.prevent="updateClient()"
                class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
                <div class="column is-full">
                    <h1 class="title">{{ $t('editClient.editClient') }}</h1>
                </div>
                <div class="column is-half">
                    <table class="table is-fullwidth">
                        <thead>
                            <tr>
                                <th style="min-width: 25%;">{{ $t('editClient.property') }}</th>
                                <th>{{ $t('editClient.value') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{ $t('field.username') }}</td>
                                <td><input type="text" class="input is-small" v-model="client.username" disabled></td>
                            </tr>

                            <tr>
                                <td>{{ $t('field.hostname') }}</td>
                                <td><input type="text" class="input is-small" v-model="client.hostname" disabled></td>
                            </tr>

                            <tr>
                                <td>{{ $t('field.osVersion') }}</td>
                                <td><input type="text" class="input is-small" v-model="client.os" disabled></td>
                            </tr>

                            <tr>
                                <td>{{ $t('field.appVersion') }}</td>
                                <td><input type="text" class="input is-small" v-model="client.appVersion" disabled></td>
                            </tr>

                            <tr v-for="detail in details" :key="detail.key" class="content is-small">
                                <td>{{ detail.key }}</td>
                                <td>{{ detail.value }}</td>
                            </tr>
                        </tbody>
                    </table>


                    <div class="field">
                        <label class="checkbox" :class="{ 'is-danger': !!errors.active }">
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
                            <a class="panel-block" v-for="task in tasks" :key="task.id"
                                @click="$router.push(`/tasks/${task.id}`)">
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
                            <button type="reset" class="button is-link is-light" @click="$router.back()">{{
                                $t('button.cancel')
                            }}</button>
                        </div>
                        <div class="control">
                            <button type="button" class="button is-danger is-light" @click="deleteClient()"
                                v-if="hasPermission(undefined, 'delete:client')">{{ $t('button.delete')
                                }}</button>
                        </div>
                    </div>
                </div>
            </form>

            <div v-if="activeTab == 'logs'" class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
                <div class="column is-full is-flex is-justify-content-space-between">
                    <h1 class="title">{{ $t('editClient.logs') }}</h1>
                    <span><a @click.prevent="reloadLogs()" class="button">{{ $t('button.reload') }}</a></span>
                </div>
                <div class="column is-full field is-grouped">
                    <table class="table is-striped is-fullwidth">
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
                                <td style="white-space: pre-wrap; font-family: monospace;">{{ log.message }}</td>
                                <td>{{ formatDate(log.timestamp) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100"
                v-if="activeTab == 'f-1.0.8-installed_apps'">
                <InstalledApps />
            </div>
            <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100"
                v-if="activeTab == 'f-1.0.12-drive_monitor'">
                <LocalDrives />
            </div>
        </div>
    </div>
</template>

<style scoped>
.content-container {
    overflow-y: auto;
    height: 100%;
}

.client-container {
    height: 100%;
    width: 100%;
}
</style>