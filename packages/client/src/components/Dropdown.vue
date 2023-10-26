<template>
    <div class="dropdown" v-if="options">

        <!-- Dropdown Input -->
        <input class="dropdown-input input" :class="$props.inputClass" @keydown="keyMonitor" :name="name"
            @focus="showOptions(true)" @input="showOptions(false)" @blur="exit()" v-model="searchFilter"
            :disabled="disabled" :placeholder="placeholder" autocomplete="off" />

        <!-- Dropdown Menu -->
        <div class="dropdown-content" v-show="optionsShown">
            <div class="dropdown-item" @mousedown="selectOption(option)" v-for="(option, index) in filteredOptions"
                :key="index" :class="{ preselected: index == preselectedItemIndex }">
                {{ option.name || option.id || '-' }}
            </div>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { $t } from '@/lib/locale/locale';
import { computed, ref, watch } from 'vue';
import fuzzysort from 'fuzzysort';

type KeyValuePair = {
    id: string;
    name: string;
};

const props = defineProps(
    {
        name: {
            type: String,
            required: false,
            default: 'dropdown',
            note: 'Input name'
        },
        options: {
            type: Array<KeyValuePair>,
            required: true,
            default: [],
            note: 'Options of dropdown. An array of options with id and name',
        },
        placeholder: {
            type: String,
            required: false,
            default: $t('dropdown.defaultPlaceholder'),
            note: 'Placeholder of dropdown'
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
            note: 'Disable the dropdown'
        },
        maxItem: {
            type: Number,
            required: false,
            default: 6,
            note: 'Max items showing'
        },
        inputClass: {
            type: String
        },
        isSingle: {
            type: Boolean,
            required: false,
            default: false,
        },
        allowCustom: {
            type: Boolean,
            required: false,
            default: false,
        },
        default: {
            type: String,
            required: false,
        }
    });

const emits = defineEmits<{
    (event: 'selected', selectedId?: KeyValuePair): void,
    (event: 'filter', searchFilter: string): void,
}>()

const selected = ref<KeyValuePair | undefined>(props.default ? props.options.find(o => o.id === props.default) ?? { id: props.default ?? '', name: props.default ?? '' } : undefined);
const optionsShown = ref(false);
const searchFilter = ref(selected.value?.name ?? '');
const preselectedItemIndex = ref(0);

emits('selected', selected.value);

const filteredOptions = computed(() => {
    const result = fuzzysort.go(searchFilter.value, props.options, { key: 'name', limit: props.maxItem, all: true });
    return result.map(r => r.obj);
});

function selectOption(option?: KeyValuePair) {
    if (!option && props.allowCustom) {
        selected.value = { id: searchFilter.value, name: searchFilter.value };
    } else {
        selected.value = option;
    }

    emits('selected', selected.value);

    optionsShown.value = false;
    searchFilter.value = props.isSingle ? selected.value?.name ?? '' : '';
}

function showOptions(clearInput: boolean) {
    if (!props.disabled) {
        if (clearInput && !props.allowCustom) {
            searchFilter.value = '';
        }
        optionsShown.value = true;
        preselectedItemIndex.value = 0;
    }
}

function exit() {
    optionsShown.value = false;
    selectOption(filteredOptions.value[preselectedItemIndex.value]);
}

// Selecting when pressing Enter
function keyMonitor(event: KeyboardEvent) {
    if (event.key === "Enter") {
        event.preventDefault();
        selectOption(filteredOptions.value[preselectedItemIndex.value]);
    }

    if (event.key === 'ArrowDown') {
        preselectedItemIndex.value = (preselectedItemIndex.value + 1) % Math.min(props.maxItem, filteredOptions.value.length);
    }

    if (event.key === 'ArrowUp') {
        preselectedItemIndex.value = (preselectedItemIndex.value + filteredOptions.value.length - 1) % Math.min(props.maxItem, filteredOptions.value.length);
    }
}

watch(filteredOptions, (options) => {
    if (options.length === 0) {
        selected.value = undefined;
    } else {
        selected.value = options[preselectedItemIndex.value];
    }
    emits('filter', searchFilter.value);
})
</script>
  
  
<style lang="scss" scoped>
@use '@/assets/variables' as var;

.dropdown {
    position: relative;
    display: block;
    margin: auto;
}

.dropdown-input {
    cursor: pointer;
    display: block;
    min-width: 250px;
    color: var.$primary-400;
}

.dropdown-input:hover {
    background: var.$surface-200;
}

.dropdown-content {
    position: absolute;
    color: var.$primary-400;
    background-color: var.$surface-200;
    min-width: 248px;
    border: 1px solid var.$primary-400;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow: auto;
    z-index: 1;
    width: 100%;
    height: fit-content;
}

.dropdown-content .dropdown-item {
    color: var.$primary-400;
    background-color: var.$surface-200;
    padding: 8px;
    text-decoration: none;
    display: block;
    cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item.preselected {
    color: var.$primary-400;
    background-color: var.$surface-400;
}

.dropdown:hover .dropdowncontent {
    display: block;
}
</style>