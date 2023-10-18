<script setup lang="ts">
const props = defineProps<{
    label: string,
    subText: string
}>();
</script>


<template>
    <div class="card">
        <div class="card-content">
            <p class="subtitle">
                {{ props.label }}
            </p>
            <p class="title">
                {{ props.subText }}
            </p>
        </div>
    </div>
</template>