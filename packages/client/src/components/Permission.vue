<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import request from '@/lib/request';
import type { ApiUser } from '@/types/user';
import { ref, watch, watchEffect, watchPostEffect } from 'vue';

const props = defineProps<{
    user: ApiUser,
    permission: string,
}>()

const label = props.permission.split('-').map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ');
const create = ref(hasPermission(props.user, `create:${props.permission}`));
const read = ref(hasPermission(props.user, `read:${props.permission}`));
const update = ref(hasPermission(props.user, `update:${props.permission}`));
const del = ref(hasPermission(props.user, `delete:${props.permission}`));
let debounce: number | undefined = undefined;

watch([create, read, update, del], ([nCreate, nRead, nUpdate, nDelete], [oCreate, oRead, oUpdate, oDelete]) => {
    if (nCreate) {
        del.value = true;
    }

    if (nDelete) {
        update.value = true;
    }

    if (nUpdate) {
        read.value = true;
    }

    if (!debounce) {
        debounce = setTimeout(() => {
            request.$patch<void>(`/users/${props.user.id}/permissions`, {
                permission: props.permission,
                create: create.value,
                read: read.value,
                update: update.value,
                del: del.value,
            });
            debounce = undefined
        }, 10);
    }
});
</script>
<script >
</script>
<template>
    <div class="field is-grouped">
        <div class="control is-expanded">
            <label class="label">{{ label }}</label>
        </div>
        <button class="button is-small is-rounded" @click="read = update = del = create = false">clear</button>
    </div>
    <div class="field is-grouped is-grouped-centered">
        <div class="control">
            <label class="checkbox">
                <input v-model="create" type="checkbox">
                Create
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="del" type="checkbox" :disabled="create">
                Delete
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="update" type="checkbox" :disabled="del">
                Update
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="read" type="checkbox" :disabled="update">
                Read
            </label>
        </div>
    </div>
</template>