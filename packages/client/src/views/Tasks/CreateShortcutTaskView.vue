<script lang="ts" setup>
import Icons from '@/components/Icons.vue';
import SpecialFolderPicker from '@/components/SpecialFolderPicker.vue';
import { ref, watch } from 'vue';

const content = ref({
    LinkDirectory: '',
    LinkName: '',
    TargetPath: '',
    Arguments: '',
    WorkingDirectory: '',
    IconLocation: '',
    OverrideExisting: false,
});

const props = defineProps<{
    modelValue: string
}>();
const emits = defineEmits<{
    (event: 'update:modelValue', value: string): void
}>();
if (props.modelValue) {
    content.value = JSON.parse(props.modelValue);
}

watch(content, (newValue) => {
    emits('update:modelValue', JSON.stringify(newValue));
}, { deep: true })
</script>



<template>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.linkDirectory') }}</label>
        <SpecialFolderPicker v-model="content.LinkDirectory" />
    </div>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.linkName') }}</label>
        <input class="input" v-model="content.LinkName" required />
    </div>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.targetPath') }}</label>
        <input class="input" v-model="content.TargetPath" required />
    </div>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.arguments') }}</label>
        <input class="input" v-model="content.Arguments" />
    </div>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.workingDir') }}</label>
        <input class="input" v-model="content.WorkingDirectory" />
    </div>
    <div class="field">
        <label class="label">{{ $t('createShortcutTask.iconLocation') }}</label>
        <Icons v-model="content.IconLocation" />
    </div>
    <div class="field">
        <label class="checkbox">
            <input class="checkbox" type="checkbox" v-model="content.OverrideExisting" />
            {{ $t('createShortcutTask.override') }}
        </label>
    </div>
</template>