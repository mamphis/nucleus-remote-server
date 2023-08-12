import type { PiniaPluginContext } from "pinia";

export default function piniaStoragePlugin(context: PiniaPluginContext) {
    if (context.options.persistance) {
        const savedState = localStorage.getItem(context.store.$id);
        if (savedState) {
            context.store.$patch(JSON.parse(savedState));
        }
        
        context.store.$subscribe((mutation, state) => {
            console.log(mutation, state);
            localStorage.setItem(mutation.storeId, JSON.stringify(state));
        });
    }
}


declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        // allow defining a number of ms for any of the actions
        persistance?: boolean;
    }
}