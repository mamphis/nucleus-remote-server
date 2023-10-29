<script setup lang="ts">
import router, { getCommands } from '@/router';
import userStore from '@/stores/user';
import type { Command } from '@/types/commandPaletteCommand';
import { storeToRefs } from 'pinia';
import type { VNodeRef } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';
import { ref, watchEffect } from 'vue';

type ContextType = 'global' | 'page' | 'prenav';
type Context = {
    type: ContextType;
    command?: Command;
}


const { user, isLoggedIn } = storeToRefs(userStore());
const isActive = ref(false);
const currentContext = ref<Context>({ type: 'global' });
const searchInput = ref<VNodeRef | null>(null);
const searchValue = ref('');
const contextText = ref('');

watch([currentContext, isActive], () => {
    switch (currentContext.value.type) {
        case 'global':
            contextText.value = user.value?.username ?? 'Unknown';
            break;
        case 'page':
            contextText.value = currentContext.value.command?.name ?? 'Unknown';
            break;
        default:
            break;
    }
});

const close = () => {
    isActive.value = false;
    searchValue.value = '';
};

watchEffect(() => {
    if (searchInput.value) {
        // Focus the input value if element is shown
        searchInput.value.focus()
    }
});

document.onkeydown = (event) => {
    if (!isLoggedIn.value) {
        return;
    }

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

const cmd: Command[] = [
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
    ...getCommands(),
];

const doAction = (command: Command) => {
    if (command.type === 'navigation') {
        close();
        command.action();
    }

    if (command.type === 'command') {
        close();
        command.action();
    }
};

let currentCommandIndex = ref(0);

type Cmd = {
    type: 'command' | 'caption';
}

type CaptionCommand = Cmd & {
    type: 'caption';
    name: string;
    forCommandType: 'navigation' | 'command';
}

type CommandFilter = Cmd & {
    type: 'command';
    command: Command;
    selected: boolean;
}

type CommandFilterWithCaption = CommandFilter | CaptionCommand;

function isCommand(command: unknown): command is CommandFilter {
    return !!command && typeof command === 'object' && 'type' in command && command.type === 'command';
}

const availableCommands = computed(() => {
    let commandFilters: CommandFilterWithCaption[] =
        cmd.filter(c => c.name.toLowerCase().includes(searchValue.value.toLowerCase()))
            .map(command => ({ command, selected: false, type: 'command' }));

    // Add captions
    commandFilters = [
        ...commandFilters,
        { name: 'Navigation', type: 'caption', forCommandType: 'navigation' },
        { name: 'Commands', type: 'caption', forCommandType: 'command' },
    ];

    // Add the captions before each command described by forCommandType
    const filteredCommands = commandFilters.filter(c => c.type === 'caption').reduce((acc, caption) => {
        if (!isCommand(caption)) {
            const commands = commandFilters.filter(c => c.type === 'command' && c.command.type === caption.forCommandType);

            return [...acc, caption, ...commands];
        }

        return [...acc];
    }, [] as CommandFilterWithCaption[]);

    // sort the commands and add the captions to the list
    if (filteredCommands.length > 0) {
        while (filteredCommands[currentCommandIndex.value] && filteredCommands[currentCommandIndex.value].type === 'caption') {
            currentCommandIndex.value++;
        }

        const command = filteredCommands[currentCommandIndex.value];
        if (isCommand(command)) {
            command.selected = true;
        }
    }

    return filteredCommands;
});

const updateFilter = (ev: KeyboardEvent) => {
    let { value: cmdIdx } = currentCommandIndex;
    const { value: cmds } = availableCommands;
    const command = cmds[cmdIdx];

    switch (ev.key) {
        case 'ArrowUp':
            do {
                cmdIdx--;
            } while (cmds[cmdIdx] && cmds[cmdIdx].type === 'caption');

            if (cmdIdx < 0) {
                cmdIdx = cmds.length - 1;
            }

            currentCommandIndex.value = cmdIdx;
            break;

        case 'ArrowDown':
            do {
                cmdIdx++;
            } while (cmds[cmdIdx] && cmds[cmdIdx].type === 'caption');

            if (cmdIdx >= cmds.length) {
                cmdIdx = 0;
            }

            currentCommandIndex.value = cmdIdx;
            break;

        case 'Enter':
            if (isCommand(command)) {
                doAction(command.command);
            }
            break;

        case 'Tab':
            ev.preventDefault();
            currentContext.value = { type: 'page', command: isCommand(command) ? command.command : undefined };
            break;
        default:
            break;
    }
}

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
                                    {{ contextText }}
                                </a>
                            </div>
                            <div class="control has-icons-right is-expanded">
                                <input class="input" placeholder="" v-model="searchValue" @keydown="updateFilter"
                                    :ref="(val) => searchInput = val">

                                <span class="icon is-right">
                                    <button class="delete" aria-label="close" @click.prevent="close()"></button>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="panel-block" v-for="(command, index) in availableCommands" :key="index"
                        :class="{ 'has-background-light': isCommand(command) ? command.selected : false }"
                        @click="isCommand(command) ? doAction(command.command) : () => { }"
                        @mouseenter="currentCommandIndex = index">
                        <div class="is-flex is-flex-grow-1 is-justify-content-space-between is-align-items  -center"
                            v-if="isCommand(command)">
                            <p>{{ command.command.name }}</p>

                            <span class="is-size-7 has-text-grey" v-if="currentCommandIndex === index">Tab to search Enter
                                to Jump</span>
                        </div>
                        <span v-else class="is-size-7 has-text-light">{{ command.name }}</span>

                    </div>
                </div>
            </section>
        </div>
    </div>
</template>