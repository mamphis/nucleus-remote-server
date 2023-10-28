<script setup lang="ts" generic="Model extends {[key: string]: string|number|boolean|Array<any>|Model}, TableData extends Array<Model>">
import type { SortKey, SortOrder } from '@/types/utils';
import SortOrderComp from '@/components/SortOrder.vue';
import { computed, ref } from 'vue';

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
type ArrayKeys = 'length';

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    K extends string ? `${K}${"" extends P ? "" : "."}${P}`
    : `${'[number]'}${"" extends P ? "" : "."}${P}`
    : never : never;

type Paths<T, D extends number = 3> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string | number ?
        T extends Array<infer R> ? Join<K, ArrayKeys> : never &
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : "";

type ColumnKey = Paths<TableData[number]>;
type ColumnDefinition = {
    key: ColumnKey;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    data?: (model: Model) => any;
};

type Cell = { data: any, column: ColumnDefinition };
type Data = { data: Cell[], model: Model };

const props = defineProps<{
    data: TableData,
    columns: Array<ColumnDefinition>,
    options?: {
        search?: boolean;
        sort?: boolean;
        click?: boolean;
    },
}>();

const sortOrder = ref<SortOrder<Paths<Model>, never>>([undefined, 'desc']);
const searchValue = ref('');

const data = computed(() => {
    const rows: Data[] = [];
    for (const row of props.data) {
        const rowData: Cell[] = [];
        let containsSearchValue = !props.options?.search;

        for (const column of props.columns) {
            const dataKey = column.key as string;

            const value = dataKey.split('.').reduce((prev: any, curr: any) => {
                if (curr === '[number]') {
                    return prev;
                }

                if (typeof prev === 'object' && typeof curr === 'string' && curr in prev) {
                    return prev[curr]
                }

                if (curr && typeof curr === 'object') {
                    return curr;
                }

                return undefined;
            }, row);

            if (props.options?.search && column.searchable) {
                let search = value.toString();

                if (search.toLowerCase().includes(searchValue.value.toLowerCase())) {
                    containsSearchValue = true;
                }
            }

            const data = column.data ? column.data(row) : value;

            rowData.push({
                data,
                column,
            });
        }

        if (containsSearchValue) {
            rows.push({
                data: rowData,
                model: row,
            });
        }
    }

    if (props.options?.sort) {
        const [sortKey, sortDirection] = sortOrder.value;

        if (sortKey) {
            rows.sort((a, b) => {
                const aVal = a.data.find(d => d.column.key === sortKey)?.data;
                const bVal = b.data.find(d => d.column.key === sortKey)?.data;

                if (aVal < bVal) {
                    return sortDirection === 'asc' ? -1 : 1;
                } else if (aVal > bVal) {
                    return sortDirection === 'asc' ? 1 : -1;
                } else {
                    return 0;
                }
            });
        }
    }

    return rows;
});

const emits = defineEmits<{
    (event: 'click', model: Model): void;
}>();

const onClick = (model: Model) => {
    if (!props.options?.click) {
        return;
    }

    emits('click', model);
};

const changeSortOrder = (sortKey: any) => {
    if (!props.options?.sort || !props.columns.find(c => c.key === sortKey)?.sortable) {
        return;
    }

    if (sortOrder.value[0] === sortKey) {
        if (sortOrder.value[1] === 'asc') {
            sortOrder.value = [undefined, 'desc'];
        } else if (sortOrder.value[1] === 'desc') {
            sortOrder.value = [sortKey, 'asc'];
        }
    } else {
        sortOrder.value = [sortKey, 'desc'];
    }
}

</script>

<template>
    <div class="wrapper">
        <div class="field" v-if="props.options?.search">
            <input type="text" class="input" :placeholder="$t('advancedTable.searchPlaceholder')" v-model="searchValue">
        </div>
        <table class="table is-striped is-fullwidth">
            <thead>
                <tr>
                    <th v-for="(column, index) in columns" :key="index" @click="changeSortOrder(column.key)" :class="{
                        'is-clickable': options?.sort && column.sortable,
                    }">
                        <span>
                            {{ column.label }}
                            <SortOrderComp :sortKey="column.key" :sort-order="sortOrder"
                                v-if="options?.sort && column.sortable" />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(tr, index) in data" :key="index" @click="onClick(tr.model)" :class="{
                    'is-clickable': options?.click,
                }">
                    <td v-for="(td, index) in tr.data" :key="index">
                        <input type="checkbox" :checked="td.data" v-if="typeof td.data === 'boolean'" disabled>
                        <span v-else>{{ td.data }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.is-clickable {
    cursor: pointer;
    user-select: none;
}
</style>