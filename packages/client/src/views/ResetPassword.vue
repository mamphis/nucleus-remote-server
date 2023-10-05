<script lang="ts" setup>
import { ref } from 'vue';
import { eventStore } from '@/stores/eventBus';
import userStore from '@/stores/user';
import { $t } from '@/lib/locale/locale';
const email = ref("");

const { sendNotification } = eventStore();
const user = userStore();

const sendResetLink = async () => {
    await user.sendResetLink(email.value);

    sendNotification('info', $t('resetPassword.resetLinkSend'));
}
</script>
<template>
    <form @submit.prevent="sendResetLink()">
        <h1 class="title">{{ $t('resetPassword.resetPassword') }}</h1>
        <div class="field">
            <label class="label" for="email">{{ $t('field.eMail') }}</label>
            <div class="control">
                <input class="input" type="email" name="email" id="email" v-model="email">
            </div>
        </div>
        <div class="field">
            <button class="button" type="submit">{{ $t('resetPassword.sendResetLink') }}</button>
        </div>
    </form>
</template>

<style scoped>
form,
.field {
    display: flex;
    flex-direction: column;
}

form {
    width: 400px;
    margin: auto;
}

.field {
    margin-top: 2rem;
}

form {
    border: 1px solid var(--color-border);
    padding: 1rem;
    border-radius: 8px;
}
</style>
