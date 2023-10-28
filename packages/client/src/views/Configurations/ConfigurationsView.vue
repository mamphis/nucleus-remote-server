<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiConfiguration } from '@/types/configuration';
import request, { isErrorResponse } from '../../lib/request';
import AdvancedTable from '@/components/AdvancedTable.vue';


const { user } = userStore();
const configurationsResponse = await request.$get<ApiConfiguration[]>('configurations');
const configurations = configurationsResponse.assertNotError().toRef();
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('configurations.configurations') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:configuration')"
                    @click="$router.push('/configurations/new')">
                    {{ $t('configurations.newConfiguration') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <AdvancedTable :data="configurations" :columns="[
                { key: 'name', label: $t('field.name'), sortable: true, searchable: true },
                { key: 'group.[number].length', label: $t('field.groupCount'), sortable: true, searchable: true },
                { key: 'task.[number].length', label: $t('field.taskCount'), sortable: true, searchable: true },
            ]" :options="{ search: true, click: true }" @click="(configuration) => $router.push(`/configurations/${configuration.id}`)" />
        </div>
    </div>
</template>