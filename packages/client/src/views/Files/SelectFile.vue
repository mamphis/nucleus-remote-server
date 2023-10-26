<script setup lang="ts">
import request from '@/lib/request';
import type { ApiFile } from '@/types/file';
import { watch } from 'vue';
import { ref } from 'vue';

const modalShown = ref(false);
type File = {
    id: string;
    name: string;
    path: string;
};
const props = defineProps<{
    modelValue: string
    files: Array<File>
}>()

const id = ref(props.modelValue);

const emits = defineEmits<{
    (event: 'update:modelValue', value?: string): void
}>()

const selectedFile = ref(props.files.find(i => i.id === id.value));

const selectFile = (file?: File) => {
    if (file) {
        id.value = file.id;
        selectedFile.value = file;
    }

    modalShown.value = false;
    emits('update:modelValue', id.value);
}

watch(id, (value) => {
    selectedFile.value = props.files.find(i => i.id === value);
    selectFile();
});
</script>

<template>
    <div class="field has-addons">
        <div class="control is-expanded">
            <input class="input" v-model="id" />
        </div>
        <div class="control">
            <button type="button" class="button control" @click="modalShown = true">{{ $t('files.choose') }}</button>
        </div>
    </div>
    <div class="modal" :class="{ 'is-active': modalShown }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="files">
                <div class="file" v-for="file in files" :key="file.id" @click="selectFile(file)">
                    <img :src="file.path" :alt="file.name">
                </div>
            </div>
        </div>
        <button class="modal-close is-large" @click="modalShown = false" aria-label="close"></button>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as var;

.modal .files {
    display: flex;
    flex-wrap: wrap;
}

.modal .file {
    width: 128px;
    height: 128px;
    margin: 8px;
    background-color: var.$surface-600;
    color: var.$primary-400;
    overflow-wrap: break-word;

    cursor: pointer;
}
</style>