<script setup lang="ts">
import router from '@/router';
import userStore from '@/stores/user';
import { storeToRefs } from 'pinia';
import type { VNodeRef } from 'vue';
import { computed } from 'vue';
import { ref, watchEffect } from 'vue';

const { user, isLoggedIn } = storeToRefs(userStore());
const isActive = ref(false);
const currentContext = computed(() => user.value?.username ?? '');
const searchInput = ref<VNodeRef | null>(null);
const searchValue = ref('');

const close = () => {
    isActive.value = false;
    searchValue.value = '';
};

type CommandType = 'command' | 'navigation';

type Command = {
    name: string;
    description: string;
    action: () => void;
    type: CommandType;
};


watchEffect(() => {
    if (searchInput.value) {
        // Focus the input value if element is shown
        searchInput.value.focus()
    }
});

document.onkeydown = (event) => {
    if (event.ctrlKey && event.key === 'k') {
        // Toggle Command Palette
        isActive.value = !isActive.value;
        if (!isActive.value) {
            close();
        }
        event.preventDefault();
    }

    if (isActive.value && event.key === 'Escape') {
        // Close Command Palette if active
        close();
        event.preventDefault();
    }
};

const commands: Command[] = [
    {
        name: 'Open Command Palette',
        description: 'Open Command Palette',
        action: () => {
            isActive.value = true;
        },
        type: 'command',
    },
    {
        name: 'Logout',
        description: 'Logout',
        action: () => {
            router.push('/logout');
        },
        type: 'command',
    },
    {
        name: 'Users',
        description: 'Open Users',
        action: () => {
            router.push('/users');
        },
        type: 'navigation',
    },
    {
        name: 'Tenants',
        description: 'Open Tenants',
        action: () => {
            router.push('/tenants');
        },
        type: 'navigation',
    },
    {
        name: 'Clients',
        description: 'Open Clients',
        action: () => {
            router.push('/clients');
        },
        type: 'navigation',
    },
    {
        name: 'Groups',
        description: 'Open Groups',
        action: () => {
            router.push('/groups');
        },
        type: 'navigation',
    },
    {
        name: 'Tenant Users',
        description: 'Open Tenant Users',
        action: () => {
            router.push('/tenant-users');
        },
        type: 'navigation',
    },
    {
        name: 'Files',
        description: 'Open Files',
        action: () => {
            router.push('/files');
        },
        type: 'navigation',
    },
    {
        name: 'Configurations',
        description: 'Open Configurations',
        action: () => {
            router.push('/configurations');
        },
        type: 'navigation',
    },
    {
        name: 'Admin',
        description: 'Open Admin',
        action: () => {
            router.push('/admin');
        },
        type: 'navigation',
    }
];

const select = (command: Command) => {
    if (command.type === 'navigation') {
        close();
        command.action();
    }

    if (command.type === 'command') {
        close();
        command.action();
    }
};

const availableCommands = computed(() => {
    if (searchValue.value === '') {
        return commands;
    }

    return commands.filter(c => c.name.toLowerCase().includes(searchValue.value.toLowerCase()));
});

</script>

<template>
    <div class="modal" :class="{ 'is-active': isActive && isLoggedIn }" v-if="isActive && isLoggedIn">
        <div class="modal-background" @click.prevent="close()"></div>
        <div class="modal-card">
            <section class="modal-card-body">
                <div class="panel">
                    <p class="panel-heading">Command Palette</p>
                    <div class="panel-block">
                        <div class="control field has-addons">
                            <div class="control">
                                <a class="button is-static">
                                    {{ currentContext }}
                                </a>
                            </div>
                            <div class="control has-icons-right is-expanded">
                                <input class="input" placeholder="" v-model="searchValue" :ref="(val) => searchInput = val">

                                <span class="icon is-right">
                                    <button class="delete" aria-label="close" @click.prevent="close()"></button>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="panel-block"><span class="is-size-7 has-text-light">Navigation</span></div>
                    <div class="panel-block" v-for="command in availableCommands.filter(c => c.type === 'navigation')"
                        :key="command.name" @click="select(command)">
                        {{ command.name }}</div>

                    <div class="panel-block"><span class="is-size-7 has-text-light">Actions</span></div>
                    <div class="panel-block" v-for="command in availableCommands.filter(c => c.type === 'command')"
                        :key="command.name" @click="select(command)">
                        {{ command.name }}</div>
                </div>
            </section>
        </div>
    </div>
</template>