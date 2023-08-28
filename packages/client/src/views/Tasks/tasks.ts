
import { $t } from '@/lib/locale/locale';
import { type ComponentOptionsMixin, type ComputedOptions, type DefineComponent, type MethodOptions, type PropType } from 'vue';
import CreateShortcutTaskView from './CreateShortcutTaskView.vue';
import DeleteTaskView from './DeleteTaskView.vue';
import DownloadFileTaskView from './DownloadFileTaskView.vue';
import ExecuteFileTaskView from './ExecuteFileTaskView.vue';

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
    "DownloadFile": {
        label: $t('tasks.downloadFile'),
        component: DownloadFileTaskView,
    },
    "ExecuteFile": {
        label: $t('tasks.executeFile'),
        component: ExecuteFileTaskView,
    },
}
