<script setup lang="ts">
import Permission from '@/components/Permission.vue';
import { hasPermission } from '@/lib/permission';
import request, { isErrorResponse } from '@/lib/request';
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import type { ApiUser } from '@/types/user';
import { ref, nextTick, watch } from 'vue';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { userId } = router.currentRoute.value.params;
const userResponse = await request.$get<ApiUser>(`users/${userId}`);
const tenantResponse = await request.$get<ApiTenant[]>('tenants');

const user = userResponse.assertNotError().toRef();
const tenants = tenantResponse.assertNotError().toRef();

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

    const response = await request.$patch<ApiUser>(`users/${userId}`, {
        tenant: user.tenant.id,
        email: user.email,
    });

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    } else {
        sendNotification('success', $t('editUser.updateSuccessful'));
    }
}

const deleteUser = async () => {
    clearError();
    const response = await request.$delete(`users/${userId}`);
    if (!isErrorResponse(response)) {
        router.back();
    }

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    }
}

const special = ref(hasPermission(user.value, 'special:admin'));
let debounce: number | undefined = undefined;
const specialError = ref('');
watch([special], ([_nSpecial], [oSpecial]) => {
    if (!debounce) {
        debounce = setTimeout(async () => {
            const response = await request.$patch<void>(`/users/${user.value.id}/permissions`, {
                special: special.value,
            });

            if (isErrorResponse(response)) {
                special.value = oSpecial;
                specialError.value = response.message;
                setTimeout(() => specialError.value = '', 5000);
            }

            nextTick(() => debounce = undefined);
        }, 100);
    }
});
const permissions = [
    'tenant',
    'user',
    'tenant-user',
    'client',
    'group',
    'configuration',
    'task',
    'file',
];
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="title">{{ $t('editUser.editUser') }}</h1>
        </div>
        <form @submit.prevent="updateUser(user);" class="column is-full">
            <div class="field">
                <label class="label" for="">{{ $t('field.username') }}</label>
                <input type="text" class="input" v-model="user.username" disabled>
            </div>
            <div class="field">
                <label class="label" for="">{{ $t('field.tenant') }}</label>
                <span class="select">
                    <select v-model="user.tenant.id">
                        <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                            {{ tenant.name }}
                        </option>
                    </select>
                </span>
            </div>
            <div class="field">
                <label class="label" for="">{{ $t('field.eMail') }}</label>
                <input type="email" class="input" v-model="user.email" required :placeholder="$t('field.eMail')">
            </div>
            <div class="field">
                <h2>{{ $t('field.permissions') }}</h2>
                <div class="columns is-multiline">
                    <div class="column is-narrow" v-for="permission in permissions" :key="permission">
                        <Permission scope="user" :user="user" :permission="permission" />
                    </div>
                    <div class="column is-narrow">
                        <div class="field is-grouped">
                            <div class="control is-expanded">
                                <label class="label">{{ $t('permission.special') }}</label>
                            </div>
                        </div>
                        <div class="field is-grouped mb-0">
                            <div class="control">
                                <label class="checkbox">
                                    <input v-model="special" type="checkbox">
                                    {{ $t('permission.special') }}
                                </label>
                            </div>
                        </div>
                        <div class="field is-grouped">
                            <p v-if="!!specialError" class="help is-danger">{{ specialError }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field">
                <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:user')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteUser()"
                        v-if="hasPermission(undefined, 'delete:user')">{{ $t('button.delete') }}</button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
.column {
    margin-right: 50px;
}
</style>