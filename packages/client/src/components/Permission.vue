<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import type { ApiUser } from '@/types/user';
import { prependListener } from 'process';
import { ref, watch, watchEffect } from 'vue';

const props = defineProps<{
    user: ApiUser,
    permission: string,
}>()

const label = props.permission.split('-').map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(' ');
const create = ref(hasPermission(props.user, `create:${props.permission}`));
const read = ref(hasPermission(props.user, `read:${props.permission}`));
const update = ref(hasPermission(props.user, `update:${props.permission}`));
const del = ref(hasPermission(props.user, `delete:${props.permission}`));

watchEffect(() => {
    if (create.value) {
        update.value = true;
        read.value = true;
        del.value = true;
    }
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
                <input v-model="read" type="checkbox">
                Read
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="update" type="checkbox">
                Update
            </label>
        </div>
        <div class="control">
            <label class="checkbox">
                <input v-model="del" type="checkbox">
                Delete
            </label>
        </div>
    </div>
</template>