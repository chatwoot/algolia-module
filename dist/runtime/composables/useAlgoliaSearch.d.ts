import type { SearchResponse } from '@algolia/client-search';
import type { ComputedRef } from 'vue';
import type { AlgoliaIndices, RequestOptionsObject } from '../../types';
export declare type SearchParams = {
    query: string;
} & RequestOptionsObject;
export declare type UseSearchReturnType<T> = {
    result: ComputedRef<SearchResponse<T>>;
    search: (params: SearchParams) => Promise<SearchResponse<T>>;
};
export declare function useAlgoliaSearch<K extends keyof AlgoliaIndices>(indexName?: K): UseSearchReturnType<AlgoliaIndices[K]>;
export declare function useAlgoliaSearch<T>(indexName?: string): UseSearchReturnType<T>;
