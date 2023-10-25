<script setup lang="ts">
import { ref } from 'vue';
import type { ApiFile } from '@/types/file';
import { formatDate } from '@/lib/utils';
import { getMimeTypeIcon } from '@/lib/mimetypeIcons';

const files = ref<ApiFile[]>([]);
files.value.push({
    id: '1',
    filename: 'Test File',
    fileSize: 123456,
    mimeType: 'application/pdf',
    createdAt: new Date().toISOString(),
});
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('files.files') }}</h1>
            </div>
        </div>
        <div class="column is-full">
            <table class="table is-fullwidth is-narrow">
                <thead>
                    <tr>
                        <th></th>
                        <th>{{ $t('field.name') }}</th>
                        <th>{{ $t('field.fileSize') }}</th>
                        <th>{{ $t('field.createdAt') }}</th>
                        <th>{{ $t('field.user') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in files" :key="file.id" class="is-clickable"
                        @click="$router.push(`/files/${file.id}`)">
                        <td>
                            <component class="mime-type" :is="getMimeTypeIcon(file.mimeType)"></component>
                        </td>
                        <td>{{ file.filename }}</td>
                        <td>{{ file.fileSize }}</td>
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
</style>