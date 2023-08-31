<script setup lang="ts">
import router from '@/router';
import Dropdown from '@/components/Dropdown.vue';
import type { ApiConfiguration } from '@/types/configuration';
import { computed, ref } from 'vue';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import type { ApiGroup } from '@/types/group';
import { hasPermission } from '@/lib/permission';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { configurationId } = router.currentRoute.value.params;
const cfg = await request.$get<ApiConfiguration>(`configurations/${configurationId}`);
const groups = await request.$get<ApiGroup[]>(`groups`);

assertNotErrorResponse<ApiConfiguration>(cfg);
assertNotErrorResponse<ApiGroup[]>(groups);
const configuration = ref(cfg);

const remainingGroups = computed(() => {
    return groups.filter(g => !configuration.value.group.some(cg => cg.id == g.id));
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

const updateConfiguration = async () => {
    if (configuration.value.name) {
        const response = await request.$patch<ApiConfiguration>(`configurations/${configurationId}`,
            {
                ...configuration.value
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
            sendNotification('success', $t('editConfiguration.updateSuccessful'));
        }
    }
}

const addSelectedGroup = (group?: { id: string }) => {
    const groupToAdd = groups.find(g => g.id === group?.id);

    if (groupToAdd) {
        configuration.value.group.push(groupToAdd)
    }
}

const removeSelectedGroup = (group?: { id: string }) => {
    if (group) {
        configuration.value.group = configuration.value.group.filter(g => g.id !== group.id);
    }
}

const removeSelectedTask = (task?: { id: string }) => {
    if (task) {
        configuration.value.task = configuration.value.task.filter(t => t.id !== task.id);
    }
}

const deleteConfiguration = async () => {
    clearError();
    const response = await request.$delete(`configurations/${configurationId}`);
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
                <h1 class="is-title">{{ $t('editConfiguration.editConfiguration') }}</h1>
            </div>
        </div>
        <form @submit.prevent="updateConfiguration()" class="column is-full">
            <div class="field">
                <label class="label">{{ $t('field.name') }}</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" :placeholder="$t('field.name')"
                        v-model="configuration.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
            </div>

            <div class="field">
                <nav class="panel">
                    <p class="panel-heading">
                        {{ $t('field.groups') }}
                    </p>
                    <div class="panel-block">
                        <div class="field has-addons is-flex-grow-1">
                            <p class="control is-expanded">
                                <Dropdown inputClass="is-small" :options="remainingGroups"
                                    @selected="(selected) => addSelectedGroup(selected)">
                                </Dropdown>
                            </p>
                        </div>
                    </div>
                    <a class="panel-block" v-for="group in configuration.group" :key="group.id">
                        <div class="control is-expanded" @click="$router.push(`/groups/${group.id}`)">
                            {{ group?.name }}
                        </div>
                        <button class="button is-danger is-small" tabindex="-1" @mousedown="removeSelectedGroup(group)">
                            x
                        </button>
                    </a>
                </nav>
            </div>
            <div class="field">
                <nav class="panel">
                    <div class="panel-heading is-flex is-align-items-center is-justify-content-space-between">
                        {{ $t('field.tasks') }}
                        <div class="control">
                            <a class="button is-info is-small" @click="$router.push(`/new-task/${configuration.id}`)">
                                {{ $t('editConfiguration.newTask') }}
                            </a>
                        </div>
                    </div>
                    <a class="panel-block" v-for="task in configuration.task" :key="task.id"
                        @click="$router.push(`/tasks/${task.id}`)">
                        <div class="control is-expanded">
                            <input :checked="task?.active" type="checkbox" class="checkbox" disabled/> {{ task?.name }}
                        </div>
                        <button class="button is-danger is-small" tabindex="-1" @mousedown.self.stop="removeSelectedTask(task)">
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
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:configuration')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteConfiguration()"
                        v-if="hasPermission(undefined, 'delete:configuration')">{{ $t('button.delete') }}</button>
                </div>
            </div>
        </form>
    </div>
</template>

<style>
button:focus {
    color: yellowgreen;
}
</style>