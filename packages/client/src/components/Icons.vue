<script setup lang="ts">
import { watch } from 'vue';
import { ref } from 'vue';
import icons, { type Icon } from './icons';

const modalShown = ref(false);

const props = defineProps<{
    modelValue: string
}>()

const path = ref(props.modelValue);

const emits = defineEmits<{
    (event: 'update:modelValue', value?: string): void
}>()

const selectedIcon = ref(icons.find(i => i.location === path.value));

const selectIcon = (icon?: Icon) => {
    if (icon) {
        path.value = icon.location;
        selectedIcon.value = icon;
    }

    modalShown.value = false;
    emits('update:modelValue', path.value);
}

watch(path, (value) => {
    selectedIcon.value = icons.find(i => i.location === value);
    selectIcon();
});
</script>

<template>
    <div class="field has-addons">
        <div class="control is-expanded has-icons-left">
            <span class="icon is-left is-small">
                <img :src="selectedIcon?.path" alt="">
            </span>
            <input class="input" v-model="path" />
        </div>
        <div class="control">
            <button type="button" class="button control" @click="modalShown = true">{{ $t('icon.choose') }}</button>
        </div>
    </div>
    <div class="modal" :class="{ 'is-active': modalShown }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="icons">
                <div class="icon" v-for="icon in icons" :key="icon.location" @click="selectIcon(icon)">
                    <img :src="icon.path" alt="Icon">
                </div>
            </div>
        </div>
        <button class="modal-close is-large" @click="modalShown = false" aria-label="close"></button>
    </div>
</template>

<style scoped>
.modal .icons {
    display: flex;
    flex-wrap: wrap;
}

.modal .icon {
    width: 48px;
    height: 48px;
    margin: 8px;

    cursor: pointer;
}

.control .icon {
    padding: 6px;
    z-index: 10;
}
</style>