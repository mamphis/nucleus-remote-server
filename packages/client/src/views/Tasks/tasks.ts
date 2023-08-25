
import { type DefineComponent, type PropType, type ComputedOptions, type MethodOptions, type ComponentOptionsMixin } from 'vue';
import CreateShortcutTaskViewVue from './CreateShortcutTaskView.vue';
import DeleteView from './DeleteView.vue';

type ModelPropType = { modelValue: { type: PropType<string>, required: true } };
export const typeMap: Record<string, {
    label: string,
    component: InstanceType<DefineComponent<ModelPropType, {},
        {}, ComputedOptions, MethodOptions, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, ModelPropType, any, any, any>>,
}> = {
    "CreateShortcut": {
        label: "Create Shortcut",
        component: CreateShortcutTaskViewVue,
    },
    "Delete": {
        label: "Delete",
        component: DeleteView,
    },
}
