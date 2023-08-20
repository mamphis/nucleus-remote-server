<script lang="ts" setup>
import { ref, watch } from 'vue';


const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])

const model = ref(props.modelValue);

const paths: Record<string, string> = {
    Desktop: 'Desktop',
    MyDocument: 'My Document',
    MyMusic: 'My Music',
    MyPictures: 'My Pictures',
    MyVideos: 'My Videos',
    StartMenu: 'Start Menu',
    Startup: 'Startup',
}

watch(model, (value) => { emits('update:modelValue', value) });

</script>

<template>
    <span class="select">
        <select v-model="model">
            <option v-for="(path, key) in paths" :key="key" :value="key">
                {{ path }}
            </option>
        </select>
    </span>
</template>