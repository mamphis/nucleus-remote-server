<script setup lang="ts">
import type { ApiLocalDrive, ApiLocalDriveHistory } from '@/types/localDrive';
import LocalDriveHistory from './LocalDriveHistory.vue';

const props = defineProps<{
    drive: ApiLocalDrive,
    history: ApiLocalDriveHistory,
}>()

const formatBytesToGB = (bytes: number) => {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

const getProgressColor = (drive: ApiLocalDrive) => {
    const percent = getFillLevelInPercent(drive);
    if (percent < 70) {
        return 'is-success';
    } else if (percent < 90) {
        return 'is-warning';
    } else {
        return 'is-danger';
    }
}

const getFillLevelInPercent = (drive: ApiLocalDrive) => {
    return (1 - drive.driveFreeSpace / drive.driveSize) * 100;
}

</script>

<template>
    <div class="card">
        <div class="card-header">
            <p class="card-header-title">
                {{ props.drive.driveLetter }} - {{ props.drive.driveDescription }}
            </p>
        </div>
        <div class="card-content">
            <h6 class="title is-6">
                {{ formatBytesToGB(props.drive.driveSize) }} {{ props.drive.driveType }} ({{ props.drive.driveFileSystem }})
            </h6>
            <div class="columns">
                <div class="column is-flex is-align-items-center">
                    <progress class="progress" :class="getProgressColor(props.drive)"
                        :value="props.drive.driveSize - props.drive.driveFreeSpace" :max="props.drive.driveSize"
                        :title="getFillLevelInPercent(props.drive).toFixed(2) + '%'">
                    </progress>
                </div>
                <div class="column fit-content">
                    {{ formatBytesToGB(props.drive.driveSize - props.drive.driveFreeSpace) }} / {{
                        formatBytesToGB(props.drive.driveSize) }}
                </div>
            </div>
        </div>
        <footer class="card-footer">
            <LocalDriveHistory :driveHistory="props.history" />
        </footer>
    </div>
</template>

<style scoped>
.fit-content {
    flex-basis: fit-content;
    flex-grow: 0;
}
</style>