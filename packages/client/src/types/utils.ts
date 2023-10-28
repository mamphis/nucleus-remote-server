
type SortDirection = 'asc' | 'desc';
export type SortKey<K, T> = keyof K | T;
export type SortOrder<K, T> = [SortKey<K, T> | undefined, SortDirection | undefined];