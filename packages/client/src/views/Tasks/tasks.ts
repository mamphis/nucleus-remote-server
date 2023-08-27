
import { type DefineComponent, type PropType, type ComputedOptions, type MethodOptions, type ComponentOptionsMixin } from 'vue';
import CreateShortcutTaskView from './CreateShortcutTaskView.vue';
import DeleteTaskView from './DeleteTaskView.vue';
import { $t } from '@/lib/locale/locale';

type ModelPropType = { modelValue: { type: PropType<string>, required: true } };
export const typeMap: Record<string, {
    label: string,
    component: InstanceType<DefineComponent<ModelPropType, {},
        {}, ComputedOptions, MethodOptions, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, ModelPropType, any, any, any>>,
}> = {
    "CreateShortcut": {
        label: $t('tasks.createShortcut'),
        component: CreateShortcutTaskView,
    },
    "Delete": {
        label: $t('tasks.deleteFile'),
        component: DeleteTaskView,
    },
}
