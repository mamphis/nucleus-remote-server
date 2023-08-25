<script setup lang="ts">
import { hasPermission } from '@/lib/permission';
import userStore from '@/stores/user';
import type { ApiGroup } from '@/types/group';
import request, { isErrorResponse } from '../../lib/request';


const { user } = userStore();
const groups = await request.$get<ApiGroup[]>('groups');
</script>
<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="column is-full columns is-align-items-center">
            <div class="column is-half">
                <h1>Groups</h1>
            </div>
            <div class="column is-one-quarter is-offset-one-quarter is-flex is-justify-content-end">
                <button class="button" v-if="hasPermission(user, 'create:group')" @click="$router.push('/new-group')">New
                    Group</button>
            </div>
        </div>
        <div class="column is-full">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Clients</th>
                        <th>Configurations</th>
                    </tr>
                </thead>
                <tbody v-if="!isErrorResponse(groups)">
                    <tr v-for="group in groups" :key="group.id" class="is-clickable"
                        @click="$router.push(`/groups/${group.id}`)">
                        <td>{{ group.name }}</td>
                        <td>{{ group.client.length }}</td>
                        <td>{{ group.configuration.length }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>