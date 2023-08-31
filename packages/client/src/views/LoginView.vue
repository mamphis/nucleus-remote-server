<script lang="ts" setup>
import { isErrorResponse } from '@/lib/request';
import router from '@/router';
import userStore from '@/stores/user';
import { ref } from 'vue';

const password = ref("");
const username = ref("");

const errors = ref<{
    login: string,
}>({
    login: '',
});

const { login } = userStore();
const performLogin = async () => {
    const response = await login(username.value, password.value);
    if (!isErrorResponse(response)) {
        router.push('/')
    } else {
        errors.value.login = response.message;
    }
}
</script>
<template>
    <form @submit.prevent="performLogin()">
        <h1 class="is-title">{{ $t('login.login') }}</h1>
        <div class="field">
            <label class="label" for="username">{{ $t('field.username') }}</label>
            <div class="control">
                <input class="input" type="text" name="username" id="username" v-model="username">
            </div>
        </div>
        <div class="field">
            <label class="label" for="password">{{ $t('field.password') }}</label>
            <div class="control">
                <input class="input" type="password" name="password" id="password" v-model="password">
            </div>
        </div>
        <div class="field">
            <p v-if="!!errors.login" class="help is-danger">{{ errors.login }}</p>
            <button class="button" type="submit">{{ $t('login.login') }}</button>
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
