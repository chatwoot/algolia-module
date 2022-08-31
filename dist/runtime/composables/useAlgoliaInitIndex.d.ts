import type { SearchIndex } from 'algoliasearch';
import type { AlgoliaIndices, TypedSearchIndex } from '../../types';
export declare function useAlgoliaInitIndex<T extends keyof AlgoliaIndices>(indexName: T): TypedSearchIndex<T>;
export declare function useAlgoliaInitIndex<T extends string>(indexName: T): SearchIndex;
