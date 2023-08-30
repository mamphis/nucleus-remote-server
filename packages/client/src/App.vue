<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { hasPermission } from './lib/permission';
import userStore from './stores/user';
import { eventStore, type NotificationType } from './stores/eventBus';
import { reactive } from 'vue';
const burgerActive = ref(false);

const { user, isLoggedIn } = storeToRefs(userStore());
const hasClient = computed(() => hasPermission(user.value, ':client'));
const hasConfiguration = computed(() => hasPermission(user.value, ':configuration'));
const hasGroup = computed(() => hasPermission(user.value, ':group'));
const hasTenant = computed(() => hasPermission(user.value, ':tenant'));
const hasTenantUser = computed(() => hasPermission(user.value, ':tenant-user'));
const hasUser = computed(() => hasPermission(user.value, ':user'));

const { onSendNofification } = eventStore();
let notifications = ref<Notification[]>([]);
let notificationId = 0;
class Notification {
    readonly maxTime = 5000;
    timeLeft = ref(this.maxTime);

    private running = true;
    readonly id = ++notificationId;
    constructor(public readonly type: NotificationType, public readonly message: string) {
        const start = new Date().getTime();
        const updater = () => {
            this.timeLeft.value = this.maxTime - (new Date().getTime() - start);

            if (this.running) {
                requestAnimationFrame(updater.bind(this));
            }

            if (this.timeLeft.value < 0) {
                this.clear();
            }
        }

        updater();
    }

    clear() {
        this.running = false;
        notifications.value = notifications.value.filter(n => n.id != this.id);
    }
}

onSendNofification((event) => {
    if (event.data) {
        notifications.value.push(new Notification(event.data.type, event.data.message) as any);
    }
});
</script>

<template>
    <div id="notification">
        <div v-for="notification in notifications" :key="notification.message" class="notification is-light"
            :class="'is-' + notification.type">
            <button class="delete" @click="notification.clear()"></button>
            <progress :class="'is-' + notification.type" class="progress" :value="notification.timeLeft"
                :max="notification.maxTime"></progress>
            {{ notification.message }}
        </div>
    </div>
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
                </div>
                <div class="navbar-end">
                    <div class="navbar-item has-dropdown is-hoverable" v-if="user">
                        <a class="navbar-link">
                            {{ user.username }}
                        </a>

                        <div class="navbar-dropdown">
                            <RouterLink class="navbar-item" to="/profile">{{ $t('navbar.profile') }}
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
        </nav>
    </header>
    <Suspense>
        <div class="content">
            <RouterView />
        </div>
    </Suspense>
</template>

<style scoped>
#notification {
    position: absolute;
    z-index: 100;
    right: 0;
    top: 8px;
}

#notification .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
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

.content {
    height: calc(100% - var(--header-height));
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>
