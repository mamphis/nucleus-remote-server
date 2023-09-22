<script setup lang="ts">
import { eventStore, type NotificationType } from '@/stores/eventBus';
import { ref } from 'vue';



const { onSendNofification } = eventStore();
let notifications = ref<Notification[]>([]);
let notificationId = 0;
class Notification {
    readonly maxTime = 5000;
    timeLeft = ref(this.maxTime);

    private running = true;
    readonly id = ++notificationId;

    private previousTimestamp: number = 0;

    constructor(public readonly type: NotificationType, public readonly message: string, public readonly onclick?: () => void) {
        requestAnimationFrame(this.update.bind(this));
    }

    update(timestamp: number) {
        if (this.previousTimestamp === 0) {
            this.previousTimestamp = timestamp;
        }

        let elapsed = timestamp - this.previousTimestamp;
        if (!this.running) {
            elapsed = 0;
        }

        this.previousTimestamp = timestamp;

        this.timeLeft.value -= elapsed;
        requestAnimationFrame(this.update.bind(this));

        if (this.timeLeft.value < 0) {
            this.clear();
        }
    }

    clear() {
        this.running = false;
        notifications.value = notifications.value.filter(n => n.id != this.id);
    }

    pause() {
        this.running = false;
    }

    continue() {
        this.running = true;
    }
}

onSendNofification((event) => {
    if (event.data) {
        notifications.value.push(new Notification(event.data.type, event.data.message, event.data.onclick) as any);
    }
});
</script>

<template>
    <div id="notification">
        <div v-for="notification in notifications" :key="notification.message" class="notification is-light"
            :class="'is-' + notification.type + (notification.onclick ? ' clickable' : '')" @mouseenter="notification.pause()" @mouseleave="notification.continue()"
            @click.self="notification.onclick?.()">
            <button class="delete" @click.prevent="notification.clear()"></button>
            <progress :class="'is-' + notification.type" class="progress" :value="notification.timeLeft"
                :max="notification.maxTime"></progress>
            {{ notification.message }}
        </div>
    </div>
</template>

<style scoped>
#notification {
    position: absolute;
    z-index: 100;
    right: 0;
    top: 8px;
}

#notification .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    transition: width 0.5s ease;
}

#notification>div {
    user-select: none;
}

#notification>div.clickable {
    cursor: pointer;
}
</style>