<template>
    <div class="dropdown" v-if="options">

        <!-- Dropdown Input -->
        <input class="dropdown-input input" :class="$props.inputClass" :name="name" @focus="showOptions(true)" @input="showOptions(false)" @blur="exit()"
            @keyup="keyMonitor" v-model="searchFilter" :disabled="disabled" :placeholder="placeholder" autocomplete="off" />

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
        }
    });

const emits = defineEmits<{
    (event: 'selected', selectedId?: KeyValuePair): void,
    (event: 'filter', searchFilter: string): void,
}>()

const selected = ref<KeyValuePair>();
const optionsShown = ref(false);
const searchFilter = ref('');
const preselectedItemIndex = ref(0);

emits('selected', selected.value);

const filteredOptions = computed(() => {
    const filtered = [];
    const regOption = new RegExp(searchFilter.value, 'ig');
    for (const option of props.options) {
        if (searchFilter.value.length < 1 || option.name.match(regOption)) {
            if (filtered.length < props.maxItem) filtered.push(option);
        }
    }
    return filtered;
});


function selectOption(option: KeyValuePair) {
    console.log('dropdown', 'select', option)
    selected.value = option;
    emits('selected', option);
    optionsShown.value = false;
    searchFilter.value = '';
}

function showOptions(clearInput: boolean) {
    if (!props.disabled) {
        if (clearInput) {
            searchFilter.value = '';
        }
        optionsShown.value = true;
        preselectedItemIndex.value = 0;
    }
}

function exit() {
    optionsShown.value = false;
}

// Selecting when pressing Enter
function keyMonitor(event: KeyboardEvent) {
    if (event.key === "Enter" && filteredOptions.value[preselectedItemIndex.value]) {
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
  
  
<style lang="css" scoped>
.dropdown {
    position: relative;
    display: block;
    margin: auto;
}

.dropdown-input {
    cursor: pointer;
    display: block;
    min-width: 250px;
}

.dropdown-input:hover {
    background: #f8f8fa;
}

.dropdown-content {
    position: absolute;
    background-color: #fff;
    min-width: 248px;
    border: 1px solid #e7ecf5;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow: auto;
    z-index: 1;
    width: 100%;
    height: fit-content;
}

.dropdown-content .dropdown-item {
    color: black;
    padding: 8px;
    text-decoration: none;
    display: block;
    cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item.preselected {
    background-color: #e7ecf5;
}

.dropdown:hover .dropdowncontent {
    display: block;
}
</style>