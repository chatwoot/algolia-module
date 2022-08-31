import { useAlgoliaRef } from "./useAlgoliaRef.mjs";
export function useAlgoliaInitIndex(indexName) {
  const algolia = useAlgoliaRef();
  const algoliaIndex = algolia?.initIndex(indexName);
  return algoliaIndex;
}
