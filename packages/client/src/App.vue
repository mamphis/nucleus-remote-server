<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/login" class="nav-end">Login</RouterLink>
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
