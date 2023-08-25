<script lang="ts" setup>
import { $t } from '@/lib/locale/locale';
import { ref, watch } from 'vue';


const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])

const model = ref(props.modelValue);

const paths: Record<string, string> = {
    Desktop: $t('specialFolder.Desktop'),
    MyDocument: $t('specialFolder.MyDocument'),
    MyMusic: $t('specialFolder.MyMusic'),
    MyPictures: $t('specialFolder.MyPictures'),
    MyVideos: $t('specialFolder.MyVideos'),
    StartMenu: $t('specialFolder.StartMenu'),
    Startup: $t('specialFolder.Startup'),
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