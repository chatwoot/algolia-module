import { computed } from "vue";
import { useAlgoliaInitIndex } from "./useAlgoliaInitIndex.mjs";
import { useState, useRuntimeConfig } from "#imports";
export function useAlgoliaSearch(indexName) {
  const config = useRuntimeConfig();
  const index = indexName || config.algolia.globalIndex;
  if (!index)
    throw new Error("`[@nuxtjs/algolia]` Cannot search in Algolia without `globalIndex` or `indexName` passed as a parameter");
  const algoliaIndex = useAlgoliaInitIndex(index);
  const result = useState(`${index}-search-result`, () => null);
  const search = async ({ query, requestOptions }) => {
    const searchResult = await algoliaIndex.search(query, requestOptions);
    result.value = searchResult;
    return searchResult;
  };
  return {
    result: computed(() => result.value),
    search
  };
}
