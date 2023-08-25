/// <reference types="vite/client" />
import type $t from '@/lib/locale/locale';
export {};

declare module 'vue' {
    interface ComponentCustomProperties {
        $t;
    }
}