<script lang="ts" setup>
import { $t } from '@/lib/locale/locale';
import { ref, watch } from 'vue';
import Dropdown from './Dropdown.vue';


const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])

const model = ref(props.modelValue);

const paths = [
    { id: 'Desktop', name: $t('specialFolder.Desktop') },
    { id: 'MyDocument', name: $t('specialFolder.MyDocument') },
    { id: 'MyMusic', name: $t('specialFolder.MyMusic') },
    { id: 'MyPictures', name: $t('specialFolder.MyPictures') },
    { id: 'MyVideos', name: $t('specialFolder.MyVideos') },
    { id: 'StartMenu', name: $t('specialFolder.StartMenu') },
    { id: 'Startup', name: $t('specialFolder.Startup') },
]

watch(model, (value) => { emits('update:modelValue', value) });

</script>

<template>
    <Dropdown :options="paths" :max-item="10" :is-single="true" @selected="item => model = item?.id" :allow-custom="true" :default="model"/>
    <!--     
    <span class="select">
        <select v-model="model">
            <option v-for="(path, key) in paths" :key="key" :value="key">
                {{ path }}
            </option>
        </select>
    </span> -->
</template>