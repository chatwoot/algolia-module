import { computed } from "vue";
import { useAlgoliaInitIndex } from "./useAlgoliaInitIndex.mjs";
import { useState } from "#imports";
export function useAlgoliaFacetedSearch(indexName) {
  const algoliaIndex = useAlgoliaInitIndex(indexName);
  const result = useState(`${indexName}-search-for-facet-values-result`, () => null);
  const search = async ({ facet, requestOptions }) => {
    const { name, query } = facet;
    const searchForFacetValuesResult = await algoliaIndex.searchForFacetValues(name, query, requestOptions);
    result.value = searchForFacetValuesResult;
    return searchForFacetValuesResult;
  };
  return {
    result: computed(() => result.value),
    search
  };
}
