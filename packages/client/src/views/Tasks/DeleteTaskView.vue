<script lang="ts" setup>
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import { ref, watch } from 'vue';

const content = ref({
    Path: '',
    Recursive: false,
    IgnoreIfMissing: true,
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
        <label class="label" for="">{{ $t('deleteTask.path') }}</label>
        <SpecialFolderPicker v-model="content.Path" required />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.Recursive" />
            {{ $t('deleteTask.recursive') }}
        </label>
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.IgnoreIfMissing" />
            {{ $t('deleteTask.ignoreIfMissing') }}
        </label>
    </div>
</template>