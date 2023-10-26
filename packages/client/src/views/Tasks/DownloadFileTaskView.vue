<script lang="ts" setup>
import SelectFile from '@/views/Files/SelectFile.vue';
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import request from '@/lib/request';
import type { ApiFile } from '@/types/file';
import { ref, watch } from 'vue';

const content = ref({
    RemoteUrl: '',
    Destination: '',
    Override: false,
    IgnoreIfExists: true,
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
}, { deep: true });

type File = {
    id: string;
    name: string;
    path: string;
};
const files = ref<Array<File>>([]);

(async () => {
    const filesResponse = await request.$get<ApiFile[]>('files').then(val => val.assertNotError());
    console.log(filesResponse);
    files.value = await Promise.all(filesResponse.map(async f => ({
        id: `serverfile:${f.id}`,
        name: f.filename,
        path: URL.createObjectURL(await request.$raw('GET', `files/${f.id}/download`).then(val => val.blob())),
    })));
})();
</script>

<template>
    <div class="field">
        <label class="label" for="">{{ $t('downloadFileTask.remoteUrl') }}</label>
        <SelectFile v-model="content.RemoteUrl" :files="files" />
        <!-- <input class="input" v-model="content.RemoteUrl" required /> -->
    </div>
    <div class="field">
        <label class="label" for="">{{ $t('downloadFileTask.destination') }}</label>
        <SpecialFolderPicker v-model="content.Destination" />
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.Override" />
            {{ $t('downloadFileTask.override') }}
        </label>
    </div>
    <div class="field">
        <label class="checkbox" for="">
            <input class="checkbox" type="checkbox" v-model="content.IgnoreIfExists" />
            {{ $t('downloadFileTask.ignoreIfExists') }}
        </label>
    </div>
</template>