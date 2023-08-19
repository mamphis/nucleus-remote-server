<script setup lang="ts">
import router from '@/router';
import type { ApiGroup } from '@/types/group';
import { computed, ref } from 'vue';
import request, { assertNotErrorResponse, isErrorResponse, isValidationError } from '@/lib/request';
import type { ApiConfiguration } from '@/types/configuration';
import Dropdown from '@/components/Dropdown.vue';

const { groupId } = router.currentRoute.value.params;
const grp = await request.$get<ApiGroup>(`groups/${groupId}`);
const configurations = await request.$get<ApiConfiguration>(`configurations`);

assertNotErrorResponse<ApiGroup>(grp);
assertNotErrorResponse<ApiConfiguration[]>(configurations);
const group = ref(grp);

const remainingConfiurations = computed(() => {
    return configurations.filter(c => !group.value.configuration.some(gc => gc.id == c.id));
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
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Edit group</h1>
            </div>
        </div>
        <form @submit.prevent="updateGroup()" class="column is-full">
            <div class="field">
                <label class="label">Name</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" placeholder="Name"
                        v-model="group.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
            </div>
            <div class="field">
                <nav class="panel">
                    <p class="panel-heading">
                        Configurations
                    </p>
                    <div class="panel-block">
                        <div class="field has-addons is-flex-grow-1">
                            <p class="control is-expanded">
                                <Dropdown :options="remainingConfiurations" @selected="(selected) => addSelectedConfiguration(selected)">
                                </Dropdown>
                            </p>
                            <div class="control">
                                <a class="button is-info">
                                    Add Group
                                </a>
                            </div>
                        </div>
                    </div>
                    <a class="panel-block" v-for="configuration in group.configuration" :key="configuration.id">
                        <div class="control is-expanded">
                            {{ configuration?.name }}
                        </div>
                        <button class="button is-danger is-small" @mousedown="removeSelectedConfiguration(configuration)">
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