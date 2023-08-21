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
    console.log(newValue);
    emits('update:modelValue', JSON.stringify(newValue));
}, { deep: true })
</script>



<template>
    <div class="field">
        <label class="label" for="">Link Directory</label>
        <SpecialFolderPicker v-model="content.LinkDirectory" />
    </div>
    <div class="field">
        <label class="label" for="">Link Name</label>
        <input class="input" v-model="content.LinkName" required />
    </div>
    <div class="field">
        <label class="label" for="">Target Path</label>
        <input class="input" v-model="content.TargetPath" required />
    </div>
    <div class="field">
        <label class="label" for="">Arguments</label>
        <input class="input" v-model="content.Arguments" />
    </div>
    <div class="field">
        <label class="label" for="">Working Directory</label>
        <input class="input" v-model="content.WorkingDirectory" />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.OverrideExisting" />
            Override Existing
        </label>
    </div>
</template>