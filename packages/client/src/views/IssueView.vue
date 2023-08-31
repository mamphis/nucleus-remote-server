<script setup lang="ts">
import { $t } from '@/lib/locale/locale';
import request, { isErrorResponse } from '@/lib/request';
import { eventStore } from '@/stores/eventBus';
import router from '@/router';
import { ref } from 'vue';

const { sendNotification } = eventStore();

const errors = ref<{
    general: string,
}>({
    general: '',
});

const clearError = () => {
    errors.value.general = '';
}

const content = ref('');

const createIssue = async () => {
    clearError();
    const response = await request.$post<{number: number, id: number}>(`misc/createIssue`, {
        content: content.value,
    });

    if (isErrorResponse(response)) {
        errors.value.general = response.message;
    } else {
        sendNotification('success', $t('issue.issueCreated', response.number));
        router.back();
    }
}
</script> 

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="is-title">{{ $t('issue.createIssue') }}</h1>
        </div>
        <form @submit.prevent="createIssue();" class="column is-full">
            <div class="field">
                <label class="label" for="">{{ $t('field.content') }}</label>
                <div class="control">
                    <textarea class="textarea has-fixed-size" rows="10" v-model="content"></textarea>
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
