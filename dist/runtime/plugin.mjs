import { defineNuxtPlugin, useRuntimeConfig } from "#imports";
export default defineNuxtPlugin(async (nuxtApp) => {
  const { applicationId, apiKey, lite, recommend } = useRuntimeConfig().algolia;
  const algoliasearch = lite ? await import("algoliasearch/dist/algoliasearch-lite.esm.browser").then((lib) => lib.default || lib) : await import("algoliasearch/dist/algoliasearch.esm.browser").then((lib) => lib.default || lib);
  const algoliaSearchClient = algoliasearch(applicationId, apiKey);
  nuxtApp.provide("algolia", algoliaSearchClient);
  if (recommend) {
    const algoliaRecommend = await import("@algolia/recommend/dist/recommend.esm.browser").then((lib) => lib.default || lib);
    nuxtApp.provide("algoliaRecommend", algoliaRecommend(applicationId, apiKey));
  }
});
