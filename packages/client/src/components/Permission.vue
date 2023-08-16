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

watchPostEffect(() => {
    console.log('executing effect', props.permission, create.value, update.value, read.value, del.value);
    if (create.value) {
        del.value = true;
    }

    if (del.value) {
        update.value = true;
    }

    if (update.value) {
        read.value = true;
    }

    request.$patch<void>(`/users/${props.user.id}/permissions`, {
        permission: props.permission,
        create: create.value,
        read: read.value,
        update: update.value,
        del: del.value,
    });
});
</script>

<template>
    <div class="field">
        <label class="label">{{ label }}</label>
    </div>
    <div class="field is-grouped">
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