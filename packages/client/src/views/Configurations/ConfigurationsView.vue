<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiConfiguration } from '@/types/configuration';
import request, { isErrorResponse } from '../../lib/request';


const { user } = userStore();
const configurations = await request.$get<ApiConfiguration[]>('configurations');
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1 class="title">{{ $t('configurations.configurations') }}</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:configuration')"
                    @click="$router.push('/new-configuration')">
                    {{ $t('configurations.newConfiguration') }}</button>
            </div>
        </div>
        <div class="column is-full">
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>{{ $t('field.name') }}</th>
                        <th>{{ $t('field.groupCount') }}</th>
                        <th>{{ $t('field.taskCount') }}</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(configurations)">
                    <tr v-for="configuration in configurations" :key="configuration.id" class="is-clickable"
                        @click="$router.push(`/configurations/${configuration.id}`)">
                        <td>{{ configuration.name }}</td>
                        <td>{{ configuration.group.length }}</td>
                        <td>{{ configuration.task.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>