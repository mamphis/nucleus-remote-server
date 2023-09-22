<script lang="ts" setup>
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import { ref, watch } from 'vue';

const content = ref({
    File: '',
    Arguments: '',
    HideWindow: false,
    StartIfProcessIsRunning: false,
});

const props = defineProps<{
    modelValue: string
}>()
const emits = defineEmits<{
    (event: 'update:modelValue', value: string): void
}>()
if (props.modelValue) {
    content.value = JSON.parse(props.modelValue);
}
watch(content, (newValue) => {
    emits('update:modelValue', JSON.stringify(newValue));
}, { deep: true })
</script>



<template>
    <div class="field">
        <label class="label" for="">{{ $t('executeFileTask.file') }}</label>
        <SpecialFolderPicker v-model="content.File" />
    </div>
    <div class="field">
        <label class="label" for="">{{ $t('executeFileTask.arguments') }}</label>
        <input class="input" v-model="content.Arguments" />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.HideWindow" />
            {{ $t('executeFileTask.hideWindow') }}
        </label>
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.StartIfProcessIsRunning" />
            {{ $t('executeFileTask.startIfProcessIsRunning') }}
        </label>
    </div>
</template>