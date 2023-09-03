<script setup lang="ts">
import router from '@/router';
import type { ApiGroup } from '@/types/group';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '@/lib/request';

const name = ref('');
const isDefault = ref(false);

const errors = ref({
    name: '',
    isDefault: '',
    general: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.isDefault = '';
    errors.value.general = '';
}

const createNewGroup = async () => {
    if (name.value) {
        const response = await request.$post<ApiGroup>(`groups`, {
            name: name.value,
            isDefault: isDefault.value,
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
            router.replace(`/groups/${response.id}`);
        }
    }
}
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="is-title">{{ $t('newGroup.newGroup') }}</h1>
            </div>
        </div>
        <div class="column is-full columns">
            <form @submit.prevent="createNewGroup()" class="column is-half">
                <div class="field">
                    <label class="label">{{ $t('field.name') }}</label>
                    <div class="control">
                        <input :class="{ 'is-danger': !!errors.name }" class="input" type="text"
                            :placeholder="$t('field.name')" v-model="name" required>
                    </div>
                    <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
                </div>
                <div class="field">
                    <div class="field">
                        <label class="checkbox">
                            <input class="checkbox" type="checkbox" v-model="isDefault" />
                            {{ $t('field.defaultGroup') }}
                        </label>
                    </div>
                    <p v-if="!!errors.isDefault" class="help is-danger">{{ errors.isDefault }}</p>
                </div>
                <div class="field">
                    <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <button type="submit" class="button is-link">{{ $t('button.submit') }}</button>
                    </div>
                    <div class="control">
                        <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                        }}</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>