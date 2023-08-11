<template>
    <form @submit.prevent="ev => console.log(ev)">
        <h1>Login</h1>
        <div class="field">
            <label for="username">Username</label>
            <input type="text" name="username" id="username">
        </div>
        <div class="field">
            <label for="password">Password</label>
            <input type="password" name="password" id="password">
        </div>
        <div class="field">
            <button type="submit">Login</button>
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
