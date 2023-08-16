<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import userStore from './stores/user';
import { storeToRefs } from 'pinia';
import { hasPermission } from './lib/permission';
const burgerActive = ref(false);

const { user, isLoggedIn } = storeToRefs(userStore());
const hasClient = computed(() => hasPermission(user.value, ':client'));
const hasConfigruration = computed(() => hasPermission(user.value, ':configuration'));
const hasGroup = computed(() => hasPermission(user.value, ':group'));
const hasTask = computed(() => hasPermission(user.value, ':task'));
const hasTenant = computed(() => hasPermission(user.value, ':tenant'));
const hasTenantUser = computed(() => hasPermission(user.value, ':tenant-user'));
const hasUser = computed(() => hasPermission(user.value, ':user'));

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
          <RouterLink class="navbar-item" to="/clients" v-if="hasClient">Client</RouterLink>
          <RouterLink class="navbar-item" to="/configrurations" v-if="hasConfigruration">Configruration</RouterLink>
          <RouterLink class="navbar-item" to="/groups" v-if="hasGroup">Group</RouterLink>
          <RouterLink class="navbar-item" to="/tasks" v-if="hasTask">Task</RouterLink>
          <RouterLink class="navbar-item" to="/tenants" v-if="hasTenant">Tenant</RouterLink>
          <RouterLink class="navbar-item" to="/tenantUsers" v-if="hasTenantUser">Tenant User</RouterLink>
          <RouterLink class="navbar-item" to="/users" v-if="hasUser">User</RouterLink>
        </div>
        <div class="navbar-end">
          <div class="navbar-item" v-if="user">{{ user?.username }}</div>
          <RouterLink v-if="!isLoggedIn" class="navbar-item" to="/login">Login</RouterLink>
          <RouterLink v-if="isLoggedIn" class="navbar-item" to="/logout">Logout</RouterLink>
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