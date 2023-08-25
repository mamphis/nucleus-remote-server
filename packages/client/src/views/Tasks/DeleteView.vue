<script lang="ts" setup>
import { ref, watch } from 'vue';

const content = ref({
    Path: '',
    Recursive: false,
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
        <label class="label" for="">Path</label>
        <input class="input" v-model="content.Path" required />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.Recursive" />
            Recursive
        </label>
    </div>
</template>