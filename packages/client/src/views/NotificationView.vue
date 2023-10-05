<script setup lang="ts">
import request from '@/lib/request';
import { formatDate } from '@/lib/utils';
import type { ApiNotification } from '@/types/notification';
import { notificationStore } from '@/stores/notification';

const response = await request.$get<ApiNotification[]>('notifications');
const notifications = response.assertNotError().toRef();

const { updateUnreadNotifications } = notificationStore();

const readNotification = async (notification: ApiNotification) => {
    await request.$patch(`notifications/${notification.id}`, {});
    const response = await request.$get<ApiNotification[]>('notifications');
    notifications.value = response.assertNotError();
    updateUnreadNotifications();
}

</script>
<template>
    <form @submit.prevent="" class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full">
            <h1 class="title">{{ $t('notifications.notifications') }}</h1>
        </div>
        <div class="column is-full">
            <div class="field is-grouped">
                <table class="table is-striped">
                    <thead>
                        <tr>
                            <th>{{ $t('field.read') }}</th>
                            <th>{{ $t('field.severity') }}</th>
                            <th>{{ $t('field.message') }}</th>
                            <th>{{ $t('field.timestamp') }}</th>
                            <th>{{ $t('field.approvedByUser') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="notification in notifications" :key="notification.id">
                            <td><input type="checkbox" :checked="!notification.unread" :disabled="!notification.unread"
                                    @change="readNotification(notification)"></td>
                            <td>{{ $t('notifications.severity' + notification.severity) }}</td>
                            <td>{{ notification.message }}</td>
                            <td>{{ formatDate(notification.createdAt) }}</td>
                            <td>{{ notification.approvedBy?.username }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </form>
</template>
