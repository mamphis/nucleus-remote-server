<script setup lang="ts">
import request from '@/lib/request';
import { watch } from 'vue';
import { ref } from 'vue';

const modalShown = ref(false);
type Image = {
    id: string;
    name: string;
    path: string;
};
const props = defineProps<{
    modelValue: string
    images: Array<Image>
}>()

const id = ref(props.modelValue);

const emits = defineEmits<{
    (event: 'update:modelValue', value?: string): void
}>()

const selectedImage = ref(props.images.find(i => i.id === id.value));

const selectImage = (image?: Image) => {
    if (image) {
        id.value = image.id;
        selectedImage.value = image;
    }

    modalShown.value = false;
    emits('update:modelValue', id.value);
}

watch(id, (value) => {
    selectedImage.value = props.images.find(i => i.id === value);
    selectImage();
});
</script>

<template>
    <div class="field has-addons">
        <div class="control is-expanded">
            <input class="input" v-model="id" />
        </div>
        <div class="control">
            <button type="button" class="button control" @click="modalShown = true">{{ $t('icon.choose') }}</button>
        </div>
    </div>
    <div class="modal" :class="{ 'is-active': modalShown }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="images">
                <div class="image" v-for="image in images" :key="image.id" @click="selectImage(image)">
                    <img :src="image.path" :alt="image.name">
                </div>
            </div>
        </div>
        <button class="modal-close is-large" @click="modalShown = false" aria-label="close"></button>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/variables' as var;

.modal .images {
    display: flex;
    flex-wrap: wrap;
}

.modal .image {
    width: 128px;
    height: 128px;
    margin: 8px;
    background-color: var.$surface-600;
    color: var.$primary-400;
    overflow-wrap: break-word;
    
    cursor: pointer;
}

</style>