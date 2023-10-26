<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ApiFile } from '@/types/file';
import { formatDate, humanizeFileSize } from '@/lib/utils';
import { getMimeTypeIcon } from '@/lib/mimetypeIcons';
import { onUnmounted } from 'vue';
import request, { isErrorResponse } from '@/lib/request';
import FileDisplay from './FileDisplay.vue';

const FILESIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

const filesResponse = await request.$get<ApiFile[]>('files');
const files = filesResponse.assertNotError().toRef();

const errorFiles = ref<ApiFile[]>([]);
const isDropping = ref(false);

function preventDefaults(e: DragEvent) {
    e.preventDefault()
    if (e.type === 'dragenter' || e.type === 'dragover') {
        isDropping.value = true;
    } else if (e.type === 'dragleave' || e.type === 'drop') {
        isDropping.value = false;
    }
}

type DragEvents = keyof Pick<GlobalEventHandlersEventMap, 'dragenter' | 'dragover' | 'dragleave' | 'drop'>;
const events: DragEvents[] = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
    events.forEach((eventName) => {
        document.body.addEventListener(eventName, preventDefaults)
    });
})

onUnmounted(() => {
    events.forEach((eventName) => {
        document.body.removeEventListener(eventName, preventDefaults)
    });
});

async function onDrop(e: DragEvent) {
    console.log(e.dataTransfer?.files);
    isDropping.value = false;

    for (const file of e.dataTransfer?.files ?? []) {
        if (file.size > FILESIZE_LIMIT) {
            errorFiles.value.push({
                filename: file.name,
                fileSize: file.size,
                mimeType: file.type,
                createdAt: new Date().toISOString(),
                id: '',
            });
            continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await request.$post<ApiFile[]>('files', formData);

        if (isErrorResponse(response)) {
            errorFiles.value.push({
                filename: file.name,
                fileSize: file.size,
                mimeType: file.type,
                createdAt: new Date().toISOString(),
                id: '',
            });
        }
    }

    files.value = await request.$get<ApiFile[]>('files').then((res) => res.assertNotError());
}

const selectedFile = ref<ApiFile | undefined>(undefined);

</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <FileDisplay :file="selectedFile" @close="selectedFile = undefined" />
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('files.files') }}</h1>
            </div>
        </div>
        <div class="dropper column is-full" @drop.prevent="onDrop" :class="{ 'is-dropping': isDropping }"
            v-show="isDropping">
            <h1 class="title has-text-centered">{{ $t('files.dropFilesHere') }}</h1>
        </div>
        <div class="column is-full">
            <table class="table is-fullwidth is-narrow">
                <thead>
                    <tr>
                        <th></th>
                        <th>{{ $t('field.name') }}</th>
                        <th>{{ $t('field.fileSize') }}</th>
                        <th>{{ $t('field.createdAt') }}</th>
                        <th>{{ $t('field.username') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in files" :key="file.id" class="is-clickable" @click="selectedFile = file">
                        <td>
                            <component class="mime-type" :is="getMimeTypeIcon(file.mimeType)"></component>
                        </td>
                        <td>{{ file.filename }}</td>
                        <td>{{ humanizeFileSize(file.fileSize) }}</td>
                        <td>{{ formatDate(file.createdAt) }}</td>
                        <td>{{ file.uploadedBy?.username }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/variables' as var;

svg.mime-type {
    width: 24px;
    height: 24px;
    color: var.$primary-400;
}


.dropper.is-dropping {
    border-radius: 16px;
    border: 2px dashed var.$primary-400;
    height: 64px;
    padding: 8px;
}
</style>