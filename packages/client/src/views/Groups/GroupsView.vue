<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiGroup } from '@/types/group';
import request, { isErrorResponse } from '../../lib/request';
import AdvancedTable from '@/components/AdvancedTable.vue';


const { user } = userStore();
const groupResponse = await request.$get<ApiGroup[]>('groups');
const groups = groupResponse.assertNotError().toRef();
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('groups.groups') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:group')" @click="$router.push('/groups/new')">
                    {{ $t('groups.newGroup') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <AdvancedTable :data="groups" :columns="[
                { key: 'name', label: $t('field.name'), sortable: true, searchable: true },
                { key: 'isDefault', label: $t('field.defaultGroup'), sortable: true, searchable: true },
                { key: 'client.[number].length', label: $t('field.clientCount'), sortable: true, searchable: true },
                { key: 'configuration.[number].length', label: $t('field.configurationCount'), sortable: true, searchable: true },
            ]" :options="{ search: true, click: true }" @click="(group) => $router.push(`/groups/${group.id}`)" />
        </div>
    </div>
</template>