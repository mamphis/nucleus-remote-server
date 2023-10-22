<script setup lang="ts">
import request from '@/lib/request';
import router from '@/router';
import LocalDrive from '@/components/LocalDrive.vue';
import type { ApiLocalDriveResponse } from '@/types/localDrive';

const { clientId } = router.currentRoute.value.params;
const localDriveResponse = await request.$get<ApiLocalDriveResponse>(`clients/${clientId}/localDrives`);
const localDrives = localDriveResponse.assertNotError().toRef();


</script>

<template>
    <div class="column is-full">
        <h1 class="title">{{ $t('editClient.feature.localDrive') }}</h1>
    </div>

    <div class="column is-full">
        <div class="columns is-multiline">
            <div class="column is-half" v-for="drive in localDrives.drives" :key="drive.driveLetter">
                <LocalDrive :drive="drive"
                    :history="localDrives.history.filter(h => h.driveLetter === drive.driveLetter)" />
            </div>
        </div>
    </div>
</template>