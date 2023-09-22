import { defineStore } from "pinia";
export type EventHandler<T> = ((evt: Event<T>) => void) & { _once?: boolean };

export interface Event<T> {
    type: string;
    data?: T;
    timestamp: number;
    once: boolean;
}

export class EventEmitter {
    _eventHandlers: Record<string, EventHandler<any>[] | undefined> = {};

    isValidType(type: string) {
        return typeof type === 'string';
    }

    isValidHandler<T>(handler: EventHandler<T>) {
        return typeof handler === 'function';
    }

    on<T>(type: string, handler: EventHandler<T>) {
        if (!type || !handler) return false;

        if (!this.isValidType(type)) return false;
        if (!this.isValidHandler(handler)) return false;

        let handlers = this._eventHandlers[type];
        if (!handlers) handlers = this._eventHandlers[type] = [];

        // when the same handler is passed, listen it by only once.
        if (handlers.indexOf(handler) >= 0) return false;

        handler._once = false;
        handlers.push(handler);
        return true;
    }

    once<T>(type: string, handler: EventHandler<T>) {
        if (!type || !handler) return false;

        if (!this.isValidType(type)) return false;
        if (!this.isValidHandler(handler)) return false;

        const ret = this.on(type, handler);
        if (ret) {
            // set `_once` private property after listened,
            // avoid to modify event handler that has been listened.
            handler._once = true;
        }

        return ret;
    }

    off<T>(type?: string, handler?: EventHandler<T>) {
        // listen off all events, when if no arguments are passed.
        // it does samething as `offAll` method.
        if (!type) return this.offAll();

        // listen off events by type, when if only type argument is passed.
        if (!handler) {
            this._eventHandlers[type] = [];
            return;
        }

        if (!this.isValidType(type)) return;
        if (!this.isValidHandler(handler)) return;

        const handlers = this._eventHandlers[type];
        if (!handlers || !handlers.length) return;

        // otherwise, listen off the specified event.
        for (let i = 0; i < handlers.length; i++) {
            const fn = handlers[i];
            if (fn === handler) {
                handlers.splice(i, 1);
                break;
            }
        }
    }

    offAll() {
        this._eventHandlers = {};
    }

    fire<T>(type: string, data?: T) {
        if (!type || !this.isValidType(type)) return;

        const handlers = this._eventHandlers[type];
        if (!handlers || !handlers.length) return;

        const event = this.createEvent(type, data);

        for (const handler of handlers) {
            if (!this.isValidHandler(handler)) continue;
            if (handler._once) event.once = true;

            // call event handler, and pass the event argument.
            handler(event);

            // if it's an once event, listen off it immediately after called handler.
            if (event.once) this.off(type, handler);
        }
    }

    createEvent<T>(type: string, data?: T, once = false) {
        const event: Event<T> = { type, data, timestamp: Date.now(), once };
        return event;
    }
}
export type NotificationType = 'info' | 'warning' | 'success';
const eventEmitter = new EventEmitter();
export const eventStore = defineStore('event', () => {
    type Notification = {
        type: NotificationType,
        message: string,
        onclick?: () => void;
    };

    const sendNotification = (type: NotificationType, message: string, onclick?: () => void) => {
        eventEmitter.fire<Notification>('notification', { type, message, onclick });
    }

    const onSendNofification = (listener: (notification: Event<Notification>) => void) => {
        eventEmitter.on<Notification>('notification', listener);
    }

    return {
        onSendNofification,
        sendNotification,
    };
});
