<script setup lang="ts">
import router from '@/router';
import type { ApiTenant } from '@/types/tenant';
import { ref } from 'vue';
import request, { isErrorResponse, isValidationError } from '../../lib/request';
import { hasPermission } from '@/lib/permission';
import { eventStore } from '@/stores/eventBus';
import { $t } from '@/lib/locale/locale';

const { sendNotification } = eventStore();

const { tenantId } = router.currentRoute.value.params;
const response = await request.$get<ApiTenant>(`tenants/${tenantId}`);
const tenant = response.assertNotError().toRef();

const errors = ref({
    name: '',
    maxClients: '',
    general: '',
});

const clearError = () => {
    errors.value.name = '';
    errors.value.maxClients = '';
    errors.value.general = '';
}

const updateTenant = async () => {
    if (tenant.value.name) {
        clearError();
        const response = await request.$patch<ApiTenant>(`tenants/${tenantId}`, {
            name: tenant.value.name,
            maxClients: tenant.value.maxClients,
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
            sendNotification('success', $t('editTenant.updateSuccessful'));
        }
    }
}

const deleteTenant = async () => {
    clearError();
    const response = await request.$delete(`tenants/${tenantId}`);
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
                <h1>{{ $t('editTenant.editTenant') }}</h1>
            </div>
        </div>
        <form @submit.prevent="updateTenant()" class="column is-full" v-if="!isErrorResponse(tenant)">
            <div class="field">
                <label class="label">{{ $t('field.name') }}</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.name }" class="input" type="text" :placeholder="$t('field.name')"
                        v-model="tenant.name" required>
                </div>
                <p v-if="!!errors.name" class="help is-danger">{{ errors.name }}</p>
            </div>
            <div class="field">
                <label class="label">{{ $t('field.maxClients') }}</label>
                <div class="control">
                    <input :class="{ 'is-danger': !!errors.maxClients }" class="input" type="number"
                        :placeholder="$t('field.maxClients')" v-model="tenant.maxClients" required>
                </div>
                <p v-if="!!errors.maxClients" class="help is-danger">{{ errors.maxClients }}</p>
            </div>

            <div class="field">
                <p v-if="!!errors.general" class="help is-danger">{{ errors.general }}</p>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button type="submit" class="button is-link" v-if="hasPermission(undefined, 'update:tenant')">{{
                        $t('button.submit') }}</button>
                </div>
                <div class="control">
                    <button type="reset" class="button is-link is-light" @click="$router.back()">{{ $t('button.cancel')
                    }}</button>
                </div>
                <div class="control">
                    <button type="button" class="button is-danger is-light" @click="deleteTenant()"
                        v-if="hasPermission(undefined, 'delete:tenant')">{{ $t('button.delete') }}</button>
                </div>
            </div>
        </form>
    </div>
</template>