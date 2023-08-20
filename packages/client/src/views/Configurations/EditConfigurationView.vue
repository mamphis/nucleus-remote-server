<script setup lang="ts">
import router from '@/router';
import Dropdown from '@/components/Dropdown.vue';
import type { ApiConfiguration } from '@/types/configuration';
import { computed, ref } from 'vue';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import type { ApiGroup } from '@/types/group';

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

}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Edit configuration</h1>
            </div>
        </div>
        <form @submit.prevent="updateConfiguration()" class="column is-full">
            <div class="field">
                <label class="label">Name</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" placeholder="Name"
                        v-model="configuration.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
            </div>

            <div class="field">
                <nav class="panel">
                    <p class="panel-heading">
                        Groups
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
                        <div class="control is-expanded">
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
                        Tasks
                        <div class="control">
                            <a class="button is-info is-small" @click="$router.push(`/new-task/${configuration.id}`)">
                                Add Task
                            </a>
                        </div>
                    </div>
                    <a class="panel-block" v-for="task in configuration.task" :key="task.id">
                        <div class="control is-expanded">
                            {{ task?.name }}
                        </div>
                        <button class="button is-danger is-small" tabindex="-1" @mousedown="removeSelectedTask(task)">
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
                    <button type="submit" class="button is-link">Submit</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">Cancel</button>
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