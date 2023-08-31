<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import { hasPermission } from '@/lib/permission';
import request, { isErrorResponse } from '@/lib/request';
import router from '@/router';
import type { ApiUser } from '@/types/user';
import { ref } from 'vue';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { userId } = router.currentRoute.value.params;
const user = await request.$get<ApiUser>(`tenant-users/${userId}`);

const errors = ref<{
    general: string,
}>({
    general: '',
});

const clearError = () => {
    errors.value.general = '';
}

const updateUser = async (user: ApiUser) => {
    clearError();

    const response = await request.$patch<ApiUser>(`tenant-users/${userId}`, {
        email: user.email,
    });

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    } else {
        sendNotification('success', $t('editUser.updateSuccessful'));
    }
}

const deleteTenantUser = async () => {
    clearError();
    const response = await request.$delete(`tenant-users/${userId}`);
    if (!isErrorResponse(response)) {
        router.back();
    }

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    }
}

const permissions = [
    'tenant-user',
    'client',
    'group',
    'configuration',
    'task',
];
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="is-title">{{ $t('editUser.editUser') }}</h1>
        </div>
        <form @submit.prevent="updateUser(user);" class="column is-full" v-if="!isErrorResponse(user)">
            <div class="field">
                <label class="label" for="">{{ $t('field.username') }}</label>
                <input type="text" class="input" v-model="user.username" disabled>
            </div>
            <div class="field">
                <label class="label" for="">{{ $t('field.eMail') }}</label>
                <input type="email" class="input" v-model="user.email">
            </div>
            <div class="field">
                <h2>{{ $t('field.permissions') }}</h2>
                <div class="columns is-multiline">
                    <div class="column is-narrow" v-for="permission in permissions" :key="permission">
                        <Permission scope="tenant-user" :user="user" :permission="permission" />
                    </div>
                </div>
            </div>
            <div class="field">
                <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:tenant-user')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteTenantUser()"
                        v-if="hasPermission(undefined, 'delete:tenant-user')">{{ $t('button.delete') }}</button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.column {
    margin-right: 50px;
}</style>