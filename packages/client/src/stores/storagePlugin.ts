import type { PiniaPluginContext } from "pinia";

export default function piniaStoragePlugin(context: PiniaPluginContext) {
    if (context.options.persistance) {
        const savedState = localStorage.getItem(context.store.$id);
        if (savedState) {
            context.store.$patch(JSON.parse(savedState));
        }

        context.store.$subscribe((mutation, state) => {
            let store: { [key: string]: any } = {};
            if (context.options.ignore) {
                for (const key in state) {
                    if (Object.prototype.hasOwnProperty.call(state, key)) {
                        const value = state[key];
                        if (!context.options.ignore.includes(key)) {
                            store[key] = value;
                        }
                    }
                }
            } else {
                store = state;
            }

            localStorage.setItem(mutation.storeId, JSON.stringify(store));
        });
    }
}


declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        // allow defining a number of ms for any of the actions
        persistance?: boolean;
        ignore?: (keyof S)[]
    }
}