<script lang="ts" setup>
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import { ref, watch } from 'vue';

const content = ref({
    RemoteUrl: '',
    Destination: '',
    Override: false,
    IgnoreIfExists: true,
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
    console.log(newValue);
    emits('update:modelValue', JSON.stringify(newValue));
}, { deep: true })
</script>



<template>
    <div class="field">
        <label class="label" for="">{{ $t('downloadFileTask.remoteUrl') }}</label>
        <input class="input" v-model="content.RemoteUrl" required />
    </div>
    <div class="field">
        <label class="label" for="">{{ $t('downloadFileTask.destination') }}</label>
        <SpecialFolderPicker v-model="content.Destination" />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.Override" />
            {{ $t('downloadFileTask.override') }}
        </label>
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.IgnoreIfExists" />
            {{ $t('downloadFileTask.ignoreIfExists') }}
        </label>
    </div>
</template>