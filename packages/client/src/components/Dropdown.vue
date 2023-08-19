<template>
    <div class="dropdown" v-if="options">

        <!-- Dropdown Input -->
        <input class="dropdown-input input" :name="name" @focus="showOptions()" @blur="exit()" @keyup="keyMonitor"
            v-model="searchFilter" :disabled="disabled" :placeholder="placeholder" autocomplete="off"/>

        <!-- Dropdown Menu -->
        <div class="dropdown-content" v-show="optionsShown">
            <div class="dropdown-item" @mousedown="selectOption(option)" v-for="(option, index) in filteredOptions"
                :key="index">
                {{ option.name || option.id || '-' }}
            </div>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
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
            default: 'Please select an option',
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
        }
    });

const emits = defineEmits<{
    (event: 'selected', selectedId?: KeyValuePair): void,
    (event: 'filter', searchFilter: string): void,
}>()

const selected = ref<KeyValuePair>();
const optionsShown = ref(false);
const searchFilter = ref('');

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
    selected.value = option;
    optionsShown.value = false;
    searchFilter.value = selected.value.name;
    emits('selected', selected.value);
}
function showOptions() {
    if (!props.disabled) {
        searchFilter.value = '';
        optionsShown.value = true;
    }
}
function exit() {
    if (!selected.value) {
        selected.value = undefined;
        searchFilter.value = '';
    } else {
        searchFilter.value = selected.value.name;
    }
    emits('selected', selected.value);
    optionsShown.value = false;
}
// Selecting when pressing Enter
function keyMonitor(event: KeyboardEvent) {
    if (event.key === "Enter" && filteredOptions.value[0]) {
        selectOption(filteredOptions.value[0]);
    }
}

watch(filteredOptions, (options) => {
    if (options.length === 0) {
        selected.value = undefined;
    } else {
        selected.value = options[0];
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
    max-width: 248px;
    max-height: 248px;
    border: 1px solid #e7ecf5;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow: auto;
    z-index: 1;

    .dropdown-item {
        color: black;
        font-size: .7em;
        line-height: 1em;
        padding: 8px;
        text-decoration: none;
        display: block;
        cursor: pointer;

        &:hover {
            background-color: #e7ecf5;
        }
    }
}

.dropdown:hover .dropdowncontent {
    display: block;
}
</style>