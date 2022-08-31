import { RecommendationsQuery } from '@algolia/recommend';
import { ComputedRef } from 'vue';
import { RequestOptionsObject, SearchResponse } from '../../types';
export declare type RecommendParams = {
    queries: RecommendationsQuery[];
} & RequestOptionsObject;
export declare type MultipleQueriesResponse<T> = {
    results: Array<SearchResponse<T>>;
};
export declare type UseAlgoliaRecommend<T> = {
    result: ComputedRef<MultipleQueriesResponse<T>>;
    get: (params: RecommendParams) => Promise<MultipleQueriesResponse<T>>;
};
export declare function useAlgoliaRecommend<T>(): UseAlgoliaRecommend<T>;
