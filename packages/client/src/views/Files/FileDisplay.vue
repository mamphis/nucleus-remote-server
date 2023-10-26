<script setup lang="ts">
import request, { isErrorResponse } from '@/lib/request';
import type { ApiFile } from '@/types/file';
import { computed } from 'vue';
import { watch } from 'vue';
import { ref } from 'vue';
const props = defineProps<{
    file?: ApiFile;
}>();

const emit = defineEmits<{
    (event: 'close'): void,
}>();

const file = computed(() => props.file);
const url = ref('');
const mimeType = ref('');

watch(file, async (value) => {
    if (!value) {
        return;
    }

    mimeType.value = value.mimeType;
    const response = await request.$raw('GET', `files/${value.id}/download`);
    if (response.ok) {
        // parse the pdf blob file to show in iframe
        const blob = await response.blob();
        url.value = URL.createObjectURL(new File([blob], value.filename, { endings: 'native' }));
    }
});

const close = () => {
    URL.revokeObjectURL(url.value);
    mimeType.value = '';
    url.value = '';
    emit('close');
};
</script>

<template>
    <div class="modal" :class="{ 'is-active': file && url }" v-if="file">
        <div class="modal-background" @click.prevent="close()"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ file.filename }}</p>
                <button class="delete" aria-label="close" @click.prevent="close()"></button>
            </header>
            <section class="modal-card-body">
                <div class="is-flex is-justify-content-center">
                    <img v-if="mimeType.startsWith('image/')" :src="url" />
                    <iframe width="100%" height="500px" v-if="mimeType === 'application/pdf'" type="application/pdf"
                        :src="url" />
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click.prevent="close()">Cancel</button>
            </footer>
        </div>
    </div>
</template>