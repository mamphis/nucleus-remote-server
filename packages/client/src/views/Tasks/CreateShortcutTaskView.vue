<script lang="ts" setup>
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import { ref, watch } from 'vue';

const content = ref({
    LinkDirectory: '',
    LinkName: '',
    TargetPath: '',
    Arguments: '',
    WorkingDirectory: '',
    OverrideExisting: false,
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
})
</script>



<template>
    <div class="field">
        <label class="label" for="">Link Directory</label>
        <SpecialFolderPicker v-model="content.LinkDirectory" />
    </div>
</template>