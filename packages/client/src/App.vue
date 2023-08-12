<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import userStore from './stores/user';
import { storeToRefs } from 'pinia';
const burgerActive = ref(false);

const { user, isLoggedIn } = storeToRefs(userStore());
const hasClient = computed(() => user.value?.permissions.some(p => p.endsWith(':client')));
const hasConfigruration = computed(() => user.value?.permissions.some(p => p.endsWith(':configuration')));
const hasGroup = computed(() => user.value?.permissions.some(p => p.endsWith(':group')));
const hasTask = computed(() => user.value?.permissions.some(p => p.endsWith(':task')));
const hasTenant = computed(() => user.value?.permissions.some(p => p.endsWith(':tenant')));
const hasTenantUser = computed(() => user.value?.permissions.some(p => p.endsWith(':tenant-user')));
const hasUser = computed(() => user.value?.permissions.some(p => p.endsWith(':user')));

</script>

<template>
  <header>
    <nav class="navbar has-shadow">
      <div class="navbar-brand">
        <a class="navbar-item" href="/">
          <img src="@/assets/Logo.png" height="28">
        </a>

        <a role="button" class="navbar-burger" :class="{ 'is-active': burgerActive }" aria-label="menu"
          aria-expanded="false" @click="burgerActive = !burgerActive" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': burgerActive }">
        <div class="navbar-start">
          <RouterLink class="navbar-item" to="/">Home</RouterLink>
          <RouterLink class="navbar-item" to="/client" v-if="hasClient">Client</RouterLink>
          <RouterLink class="navbar-item" to="/configruration" v-if="hasConfigruration">Configruration</RouterLink>
          <RouterLink class="navbar-item" to="/group" v-if="hasGroup">Group</RouterLink>
          <RouterLink class="navbar-item" to="/task" v-if="hasTask">Task</RouterLink>
          <RouterLink class="navbar-item" to="/tenant" v-if="hasTenant">Tenant</RouterLink>
          <RouterLink class="navbar-item" to="/tenantUser" v-if="hasTenantUser">Tenant User</RouterLink>
          <RouterLink class="navbar-item" to="/user" v-if="hasUser">User</RouterLink>
        </div>
        <div class="navbar-end">
          <div class="navbar-item" v-if="user">{{ user?.username }}</div>
          <RouterLink v-if="!isLoggedIn" class="navbar-item" to="/login">Login</RouterLink>
        </div>
      </div>
    </nav>
  </header>
  <Suspense>
    <div class="content">
      <RouterView />
    </div>
  </Suspense>
</template>

<style scoped>
header {
  min-height: 64px;
  display: flex;
  align-items: center;
}

nav {
  flex-basis: 1;
  flex-grow: 1;
  display: flex;
}

nav>a {
  margin: 0 1rem;
}

nav>a:first-child {
  margin-left: 0;
}

nav>a:last-child {
  margin-right: 0;
}

nav a.router-link-active {
  text-decoration: underline;
}

nav a.nav-end {
  margin-left: auto;
}

.content {
  height: 100%;
  display: flex;
}
</style>
