<script setup lang="ts">
import router from '@/router';
import type { ApiGroup } from '@/types/group';
import { computed, ref } from 'vue';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import type { ApiConfiguration } from '@/types/configuration';
import Dropdown from '@/components/Dropdown.vue';
import type { ApiClient } from '@/types/client';
import { hasPermission } from '@/lib/permission';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { groupId } = router.currentRoute.value.params;
const grp = await request.$get<ApiGroup>(`groups/${groupId}`);
const configurations = await request.$get<ApiConfiguration>(`configurations`);
const clients = await request.$get<ApiClient>(`clients`);

assertNotErrorResponse<ApiGroup>(grp);
assertNotErrorResponse<ApiConfiguration[]>(configurations);
assertNotErrorResponse<ApiClient[]>(clients);
const group = ref(grp);

const remainingConfiurations = computed(() => {
    return configurations.filter(c => !group.value.configuration.some(gc => gc.id == c.id));
});
const remainingClients = computed(() => {
    return clients.filter(c => !group.value.client.some(gc => gc.id == c.id)).map(c => ({ id: c.id, name: c.username + " - " + c.hostname }));
});

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

const updateGroup = async () => {
    if (group.value) {
        const response = await request.$patch<ApiGroup>(`groups/${groupId}`, {
            ...group.value
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
            sendNotification('success', $t('editGroup.updateSuccessful'));
        }
    }
}

const addSelectedConfiguration = (configuration?: { id: string }) => {
    const configurationToAdd = configurations.find(g => g.id === configuration?.id);

    if (configurationToAdd) {
        group.value.configuration.push(configurationToAdd)
    }
}

const removeSelectedConfiguration = (configuration?: { id: string }) => {
    if (configuration) {
        group.value.configuration = group.value.configuration.filter(c => c.id !== configuration.id);
    }
}

const addSelectedClient = (client?: { id: string }) => {
    const clientToAdd = clients.find(g => g.id === client?.id);

    if (clientToAdd) {
        group.value.client.push(clientToAdd)
    }
}

const removeSelectedClient = (client?: { id: string }) => {
    if (client) {
        group.value.client = group.value.client.filter(c => c.id !== client.id);
    }
}

const deleteGroup = async () => {
    clearError();
    const response = await request.$delete(`groups/${groupId}`);
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
                <h1 class="is-title">{{ $t('editGroup.editGroup') }}</h1>
            </div>
        </div>
        <form @submit.prevent="updateGroup()" class="column is-full">
            <div class="field">
                <label class="label">{{ $t('field.name') }}</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" :placeholder="$t('field.name')"
                        v-model="group.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
            </div>
            <div class="field">
                <nav class="panel">
                    <p class="panel-heading">
                        {{ $t('field.configurations') }}
                    </p>
                    <div class="panel-block">
                        <div class="field has-addons is-flex-grow-1">
                            <p class="control is-expanded">
                                <Dropdown inputClass="is-small" :options="remainingConfiurations"
                                    @selected="(selected) => addSelectedConfiguration(selected)">
                                </Dropdown>
                            </p>
                        </div>
                    </div>
                    <a class="panel-block" v-for="configuration in group.configuration" :key="configuration.id">
                        <div class="control is-expanded" @click="$router.push(`/configurations/${configuration.id}`)">
                            {{ configuration?.name }}
                        </div>
                        <button class="button is-danger is-small" @mousedown="removeSelectedConfiguration(configuration)">
                            x
                        </button>
                    </a>
                </nav>
            </div>
            <div class="field">
                <nav class="panel">
                    <p class="panel-heading">
                        {{ $t('field.clients') }}
                    </p>
                    <div class="panel-block">
                        <div class="field has-addons is-flex-grow-1">
                            <p class="control is-expanded">
                                <Dropdown inputClass="is-small" :options="remainingClients"
                                    @selected="(selected) => addSelectedClient(selected)">
                                </Dropdown>
                            </p>
                        </div>
                    </div>
                    <a class="panel-block" v-for="client in group.client" :key="client.id">
                        <div class="control is-expanded" @click="$router.push(`/clients/${client.id}`)">
                            {{ client.username }} - {{ client.hostname }}
                        </div>
                        <button class="button is-danger is-small" @mousedown="removeSelectedClient(client)">
                            x
                        </button>
                    </a>
                </nav>
            </div>

            <div class="field">
                <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:group')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteGroup()"
                        v-if="hasPermission(undefined, 'delete:group')">{{ $t('button.delete') }}</button>
                </div>
            </div>
        </form>
    </div>
</template>