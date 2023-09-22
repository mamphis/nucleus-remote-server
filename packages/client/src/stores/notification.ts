import request, { isErrorResponse } from "@/lib/request";
import { defineStore } from "pinia";
import { ref } from "vue";
import { eventStore } from "./eventBus";
import { $t } from "@/lib/locale/locale";
type NotificatonStats = {
    unread: number;
    total: number;
};

export const notificationStore = defineStore('notification', () => {
    const event = eventStore();
    const unreadNotifications = ref(-1);

    const updateUnreadNotifications = async () => {
        const response = await request.$get<NotificatonStats>(`notifications/stats`);
        if (!isErrorResponse(response)) {
            if (unreadNotifications.value >= 0 && unreadNotifications.value < response.unread) {
                event.sendNotification('info', $t('notifications.newNotification'));
            }

            unreadNotifications.value = response.unread;
        }
    }

    setInterval(() => { updateUnreadNotifications(); }, 10000);
    updateUnreadNotifications();

    return {
        unreadNotifications,
        updateUnreadNotifications,
    };
})