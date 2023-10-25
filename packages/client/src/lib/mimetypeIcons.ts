import fileRegular from '@/components/mimetypes/file-regular.vue';
import filePdfRegular from '@/components/mimetypes/file-pdf-regular.vue';
import fileZipperRegular from '@/components/mimetypes/file-zipper-regular.vue';
import fileImageRegular from '@/components/mimetypes/file-image-regular.vue';
import fileVideoRegular from '@/components/mimetypes/file-video-regular.vue';
import fileAudioRegular from '@/components/mimetypes/file-audio-regular.vue';
import fileLinesRegular from '@/components/mimetypes/file-lines-regular.vue';
import type { App } from 'vue';


const defaultMimeType = 'file-regular';

const mimeTypeIconMap = new Map<string, string>([
    ['application/pdf', 'file-pdf-regular'],
    ['application/zip', 'file-zipper-regular'],
    ['image', 'file-image-regular'],
    ['video', 'file-video-regular'],
    ['audio', 'file-audio-regular'],
    ['text', 'file-lines-regular'],
    ['application', 'file-regular'],
]);

export const registerMimeTypes = (app: App): void => {
    app.component('file-regular', fileRegular);
    app.component('file-pdf-regular', filePdfRegular);
    app.component('file-zipper-regular', fileZipperRegular);
    app.component('file-image-regular', fileImageRegular);
    app.component('file-video-regular', fileVideoRegular);
    app.component('file-audio-regular', fileAudioRegular);
    app.component('file-lines-regular', fileLinesRegular);
};

export const getMimeTypeIcon = (mimeType: string): string => {
    if (!mimeType) return defaultMimeType;
    const iconName = mimeTypeIconMap.get(mimeType);
    if (iconName) return iconName;

    const [type] = mimeType.split('/');
    const genericIconName = mimeTypeIconMap.get(type);
    if (genericIconName) return genericIconName;

    return defaultMimeType;
}