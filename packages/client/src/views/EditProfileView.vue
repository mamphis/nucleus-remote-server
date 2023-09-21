<script setup lang="ts">
import { $t } from '@/lib/locale/locale';
import request, { isErrorResponse, isValidationError } from '@/lib/request';
import { eventStore } from '@/stores/eventBus';
import type { ApiUser } from '@/types/user';
import { ref } from 'vue';

const { sendNotification } = eventStore();

const response = await request.$get<ApiUser>(`users/me`);
const user = response.assertNotError().toRef();

const errors = ref({
    general: '',
    confirmPassword: '',
    oldPassword: '',
    newPassword: '',
});

const clearError = () => {
    errors.value.general = '';
    errors.value.confirmPassword = '';
    errors.value.oldPassword = '';
    errors.value.newPassword = '';
}

const updateUser = async () => {
    clearError();

    const response = await request.$patch<ApiUser>(`users/me`, {
        email: user.value.email,
    });

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    } else {
        sendNotification('success', $t('editProfile.updateSuccessful'));
    }
}

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const changePassword = async () => {
    clearError();
    if (newPassword.value !== confirmPassword.value) {
        errors.value.confirmPassword = $t('editProfile.passwordsDifferent');
    }

    const response = await request.$patch<ApiUser>(`users/changePassword`, {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
    });

    if (isValidationError(response)) {
        response.data.forEach(issue => {
            if (issue.path in errors.value) {
                errors.value[issue.path as keyof typeof errors.value] = issue.message;
            } else {
                errors.value.general = issue.message;
            }
        });
    }
    else if (isErrorResponse(response)) {
        errors.value.oldPassword = response.message;
    } else {
        sendNotification('success', $t('editProfile.passwordChangeSuccess'));
        oldPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    }

}
</script> 

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="is-title">{{ $t('editProfile.editProfile') }}</h1>
        </div>
        <form @submit.prevent="updateUser();" class="column is-full" v-if="!isErrorResponse(user)">
            <div class="field">
                <label class="label" for="">{{ $t('field.username') }}</label>
                <input type="text" class="input" v-model="user.username" disabled>
            </div>
            <div class="field">
                <label class="label" for="">{{ $t('field.eMail') }}</label>
                <input type="email" class="input" v-model="user.email" required :placeholder="$t('field.eMail')">
            </div>

            <div class="control">
                <label class="label">{{ $t('editProfile.changePassword') }}</label>
                <div class="field pl-1">
                    <label class="label" for="password">{{ $t('field.currentPassword') }}</label>
                    <div class="control">
                        <input class="input" type="password" name="password" id="password" v-model="oldPassword">
                    </div>
                    <p v-if="!!errors.oldPassword" class="help is-danger">{{ errors.oldPassword }}</p>
                </div>
                <div class="field pl-1">
                    <label class="label" for="password">{{ $t('field.newPassword') }}</label>
                    <div class="control">
                        <input class="input" type="password" name="password" id="password" v-model="newPassword">
                    </div>
                    <p v-if="!!errors.newPassword" class="help is-danger">{{ errors.newPassword }}</p>
                </div>
                <div class="field pl-1">
                    <label class="label" for="password">{{ $t('field.confirmPassword') }}</label>
                    <div class="control">
                        <input class="input" type="password" name="password" id="password" v-model="confirmPassword">
                    </div>
                    <p v-if="!!errors.confirmPassword" class="help is-danger">{{ errors.confirmPassword }}</p>
                </div>
                <div class="control">
                    <button type="button" class="button is-info" @click="changePassword()">{{ $t('button.changePassword')
                    }}</button>
                </div>
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
</template>

<style scoped>
.column {
    margin-right: 50px;
}
</style>