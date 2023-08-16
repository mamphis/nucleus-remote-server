<script lang="ts" setup>
import router from '@/router';
import userStore from '@/stores/user';
import { ref } from 'vue';
const onetimePassword: string = router.currentRoute.value.params.onetimePassword.toString();
const password = ref("");

const { verify } = userStore(); 
</script>
<template>
    <form @submit.prevent="verify(onetimePassword, password).then((response) => { router.push('/') })">
        <h1>Create Password</h1>
        <div class="field">
            <label class="label" for="password">Password</label>
            <div class="control">
                <input class="input" type="password" name="password" id="password" v-model="password">
            </div>
        </div>
        <div class="field">
            <button class="button" type="submit">Create Password</button>
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
