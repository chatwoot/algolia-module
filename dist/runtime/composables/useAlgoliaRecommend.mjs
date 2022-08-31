import { computed } from "vue";
import { useNuxtApp, useState } from "#imports";
export function useAlgoliaRecommend() {
  const { $algoliaRecommend } = useNuxtApp();
  const algoliaRecommend = $algoliaRecommend;
  if (!$algoliaRecommend) {
    throw new Error("`[@nuxtjs/algolia]` Cannot call useAlgoliaRecommend composable due to missing `algolia.recommend` option.");
  }
  const result = useState("recommend-result", () => null);
  const get = async ({ queries, requestOptions }) => {
    result.value = await algoliaRecommend.getRecommendations(queries, requestOptions);
    return result.value;
  };
  return {
    result: computed(() => result.value),
    get
  };
}
