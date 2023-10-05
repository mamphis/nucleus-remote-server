<script setup lang="ts">
import type { ApiFeatureFlag } from '@/types/featureFlag';
import { watch } from 'vue';
import { ref } from 'vue';

const { feature } = defineProps<{
    feature: ApiFeatureFlag
}>();

const emits = defineEmits<{
    (event: 'change', id: string, enabled: boolean): void
}>()

const enabled = ref(feature.enabled);
watch(enabled, (newValue) => {
    emits('change', feature.id, newValue);
});
</script>

<template>
    <div class="field">
        <label class="label">
            <input class="checkbox" type="checkbox" v-model="enabled" />
            {{ feature.name }}
        </label>
    </div>
</template>