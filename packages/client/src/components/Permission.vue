<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import request, { isErrorResponse } from '@/lib/request';
import type { ApiUser } from '@/types/user';
import { nextTick, ref, watch } from 'vue';

const props = defineProps<{
    scope: 'user' | 'tenant-user'
    user: ApiUser,
    permission: string,
}>()

const create = ref(hasPermission(props.user, `create:${props.permission}`));
const read = ref(hasPermission(props.user, `read:${props.permission}`));
const update = ref(hasPermission(props.user, `update:${props.permission}`));
const del = ref(hasPermission(props.user, `delete:${props.permission}`));
let debounce: number | undefined = undefined;

watch([create, read, update, del], ([nCreate, nRead, nUpdate, nDelete], [oCreate, oRead, oUpdate, oDelete]) => {
    if (nCreate) {
        update.value = true;
    }

    if (nDelete) {
        update.value = true;
    }

    if (nUpdate) {
        read.value = true;
    }

    if (!debounce) {
        debounce = setTimeout(async () => {
            const response = await request.$patch<void>(`/${props.scope}s/${props.user.id}/permissions`, {
                permission: props.permission,
                create: create.value,
                read: read.value,
                update: update.value,
                del: del.value,
            });

            if (isErrorResponse(response)) {
                create.value = oCreate;
                read.value = oRead;
                update.value = oUpdate;
                del.value = oDelete;
            }
            nextTick(() => debounce = undefined);
        }, 100);
    }
});
</script>
<script >
</script>
<template>
    <div class="field is-grouped">
        <div class="control is-expanded">
            <label class="label">{{ $t('permission.' + permission) }}</label>
        </div>
        <button class="button is-small is-rounded" type="button"
            @click="read = update = del = create = false">{{ $t('button.clear') }}</button>
    </div>
    <div class="field is-grouped is-grouped-centered">
        <div class="control">
            <label class="checkbox">
                <input v-model="create" type="checkbox">
                {{ $t('permission.create') }}
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="del" type="checkbox">
                {{ $t('permission.delete') }}
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="update" type="checkbox" :disabled="del || create">
                {{ $t('permission.update') }}
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="read" type="checkbox" :disabled="update">
                {{ $t('permission.read') }}
            </label>
        </div>
    </div>
</template>