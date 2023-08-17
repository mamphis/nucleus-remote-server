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
</script>
<template>
    <form
        @submit.prevent="login(username, password).then((response) => { if (!isErrorResponse(response)) { router.push('/') } else { errors.login = response.message; } })">
        <h1>Login</h1>
        <div class="field">
            <label class="label" for="username">Username</label>
            <div class="control">
                <input class="input" type="text" name="username" id="username" v-model="username">
            </div>
        </div>
        <div class="field">
            <label class="label" for="password">Password</label>
            <div class="control">
                <input class="input" type="password" name="password" id="password" v-model="password">
            </div>
        </div>
        <div class="field">
            <p v-if="!!errors.login" class="help is-danger">{{ errors.login }}</p>
            <button class="button" type="submit">Login</button>
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
