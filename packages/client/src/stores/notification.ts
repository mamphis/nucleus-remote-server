import request, { isErrorResponse } from "@/lib/request";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { eventStore } from "./eventBus";
import { $t } from "@/lib/locale/locale";
import router from "@/router";
import userStore from "./user";
type NotificatonStats = {
    unread: number;
    total: number;
};

export const notificationStore = defineStore('notification', () => {
    const event = eventStore();
    const { isLoggedIn } = storeToRefs(userStore());
    const unreadNotifications = ref(-1);

    const updateUnreadNotifications = async () => {
        if (!isLoggedIn.value) { return };

        const response = await request.$get<NotificatonStats>(`notifications/stats`);
        if (!isErrorResponse(response)) {
            if (unreadNotifications.value >= 0 && unreadNotifications.value < response.unread) {
                event.sendNotification('info', $t('notifications.newNotification'), () => router.push('/notifications'));
            }

            unreadNotifications.value = response.unread;
        }
    }

    setInterval(() => { updateUnreadNotifications(); }, 5000);
    updateUnreadNotifications();

    return {
        unreadNotifications,
        updateUnreadNotifications,
    };
})