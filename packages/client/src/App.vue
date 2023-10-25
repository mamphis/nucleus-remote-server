<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { hasPermission } from './lib/permission';
import { notificationStore } from './stores/notification';
import userStore from './stores/user';
import Notification from '@/components/Notification.vue';
import router from './router';
const burgerActive = ref(false);

const { user, isLoggedIn } = storeToRefs(userStore());
const hasClient = computed(() => hasPermission(user.value, ':client'));
const hasConfiguration = computed(() => hasPermission(user.value, ':configuration'));
const hasGroup = computed(() => hasPermission(user.value, ':group'));
const hasTenant = computed(() => hasPermission(user.value, ':tenant'));
const hasTenantUser = computed(() => hasPermission(user.value, ':tenant-user'));
const hasUser = computed(() => hasPermission(user.value, ':user'));
const hasFile = computed(() => hasPermission(user.value, ':file'));
const hasAdmin = computed(() => hasPermission(user.value, 'special:admin'));

const { unreadNotifications } = storeToRefs(notificationStore());

router.beforeEach((to, from, next) => {
    burgerActive.value = false;
    next();
});
</script>

<template>
    <Notification />
    <header>
        <nav class="navbar has-shadow">
            <div class="navbar-brand is-flex-grow-1">
                <a class="navbar-item" href="/">
                    <img src="@/assets/Logo.png" height="28">
                </a>
            </div>

            <div class="navbar-menu" :class="{ 'is-active': burgerActive }">
                <div class="navbar-start">
                    <RouterLink class="navbar-item" to="/">{{ $t('navbar.home') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/clients" v-if="hasClient">{{ $t('navbar.client') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/configurations" v-if="hasConfiguration">{{
                        $t('navbar.configuration') }}
                    </RouterLink>
                    <RouterLink class="navbar-item" to="/groups" v-if="hasGroup">{{ $t('navbar.group') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/tenant-users" v-if="hasTenantUser">{{ $t('navbar.tenantUser') }}
                    </RouterLink>
                    <RouterLink class="navbar-item" to="/tenants" v-if="hasTenant">{{ $t('navbar.tenant') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/users" v-if="hasUser">{{ $t('navbar.user') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/files" v-if="hasFile">{{ $t('navbar.file') }}</RouterLink>
                    <RouterLink class="navbar-item" to="/admin" v-if="hasAdmin">{{ $t('navbar.admin') }}</RouterLink>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item has-dropdown is-hoverable" v-if="user">
                        <a class="navbar-link">
                            {{ user.username }}
                            <span v-if="unreadNotifications > 0" class="notification-badge"></span>
                        </a>

                        <div class="navbar-dropdown">
                            <RouterLink class="navbar-item" to="/profile">{{ $t('navbar.profile') }}
                            </RouterLink>
                            <RouterLink class="navbar-item" to="/notifications">{{ $t('navbar.notifications') }}<span
                                    v-if="unreadNotifications > 0">&nbsp;({{ unreadNotifications }})</span>
                                <span v-if="unreadNotifications > 0" class="notification-badge"></span>
                            </RouterLink>
                            <hr class="navbar-divider">
                            <RouterLink class="navbar-item" to="/issue">{{ $t('navbar.reportIssue') }}
                            </RouterLink>
                        </div>
                    </div>
                    <RouterLink v-if="!isLoggedIn" class="navbar-item" to="/login">{{ $t('navbar.login') }}</RouterLink>
                    <RouterLink v-if="isLoggedIn" class="navbar-item" to="/logout">{{ $t('navbar.logout') }}</RouterLink>
                </div>
            </div>

            <a role="button" class="navbar-burger" :class="{ 'is-active': burgerActive }" aria-label="menu"
                @click="burgerActive = !burgerActive">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </nav>
    </header>
    <Suspense>
        <div class="router-view">
            <RouterView />
        </div>
    </Suspense>
</template>

<style scoped>
.notification-badge {
    position: absolute;
    right: 4px;
    top: 4px;
    font-size: smaller;
    font-weight: 600;

    background-color: rgb(38, 141, 38);
    color: white;
    border-radius: 50%;
    height: 8px;
    width: 8px;

    text-align: center;
    line-height: 1.1;
    overflow: hidden;
}

header {
    min-height: var(--header-height);
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
    font-weight: 600;
}

nav a.nav-end {
    margin-left: auto;
}

.navbar-menu.is-active {
    position: absolute;
    right: 0;
}

.router-view {
    height: calc(100% - var(--header-height));
    display: flex;
    overflow-x: auto;
    overflow-y: auto;
    padding: 0.5rem 0.75rem;
}
</style>
