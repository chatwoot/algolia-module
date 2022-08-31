import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineNuxtModule, addComponentsDir, addPlugin, addServerHandler } from '@nuxt/kit';
import defu from 'defu';
import algoliasearch from 'algoliasearch';
import scraper from 'metadata-scraper';

function createShouldInclude(options) {
  const { include } = options.crawler;
  return typeof include === "function" ? include : (route) => include.some((pattern) => route.match(pattern));
}
function createMetaGetter(options) {
  const { meta } = options.crawler;
  if (typeof meta === "function") {
    return meta;
  }
  const defaultMetaGetter = createDefaultMetaGetter();
  if (Array.isArray(meta)) {
    return async (html, route) => {
      const metadata = await defaultMetaGetter(html, route);
      return meta.reduce((acc, key) => ({ ...acc, [key]: metadata[key] }), {});
    };
  }
  return defaultMetaGetter;
}
function createDefaultMetaGetter() {
  return async (html, route) => {
    return await scraper({
      html,
      url: route
    });
  };
}
function createPageGenerateHook(nuxt, options, pages) {
  const shouldInclude = createShouldInclude(options);
  const getMeta = createMetaGetter(options);
  return async ({ html, route }) => {
    if (shouldInclude(route)) {
      const meta = await getMeta(html, route);
      const page = { href: route, ...meta };
      await nuxt.callHook("crawler:add:before", {
        route,
        html,
        meta,
        page
      });
      pages.push(page);
      await nuxt.callHook("crawler:add:after", {
        route,
        html,
        meta,
        page
      });
    }
  };
}
function createGenerateDoneHook(nuxt, options, pages) {
  return async () => {
    if (pages.length > 0 && options.crawler) {
      const { crawler: { apiKey, indexName }, applicationId } = options;
      const client = algoliasearch(applicationId, apiKey);
      const index = client.initIndex(indexName);
      await nuxt.callHook("crawler:index:before", {
        options,
        pages,
        client,
        index
      });
      await index.replaceAllObjects(pages, {
        autoGenerateObjectIDIfNotExist: true
      });
      await nuxt.callHook("crawler:index:after", {
        options,
        pages,
        client,
        index
      });
    }
  };
}

var InstantSearchThemes = /* @__PURE__ */ ((InstantSearchThemes2) => {
  InstantSearchThemes2[InstantSearchThemes2["reset"] = 0] = "reset";
  InstantSearchThemes2[InstantSearchThemes2["algolia"] = 1] = "algolia";
  InstantSearchThemes2[InstantSearchThemes2["satellite"] = 2] = "satellite";
  return InstantSearchThemes2;
})(InstantSearchThemes || {});
const module = defineNuxtModule({
  meta: {
    name: "@nuxtjs/algolia",
    configKey: "algolia",
    compatibility: {
      nuxt: "^3.0.0 || ^2.16.0",
      bridge: true
    }
  },
  defaults: {
    applicationId: "",
    apiKey: "",
    globalIndex: "",
    lite: true,
    instantSearch: false,
    docSearch: {},
    crawler: {
      apiKey: "",
      indexName: "",
      include: () => true,
      meta: ["title", "description"]
    }
  },
  setup(options, nuxt) {
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);
    if (!options.apiKey) {
      throw new Error("`[@nuxtjs/algolia]` Missing `apiKey`");
    }
    if (!options.applicationId) {
      throw new Error("`[@nuxtjs/algolia]` Missing `applicationId`");
    }
    if (options.crawler.apiKey || options.crawler.indexName) {
      if (!options.crawler.apiKey) {
        throw new Error("`[@nuxtjs/algolia]` Missing `crawler.apiKey`");
      }
      if (!options.crawler.indexName) {
        throw new Error("`[@nuxtjs/algolia]` Missing `crawler.indexName`");
      }
      const pages = [];
      nuxt.addHooks({
        "generate:page": createPageGenerateHook(nuxt, options, pages),
        "generate:done": createGenerateDoneHook(nuxt, options, pages)
      });
    }
    if (Object.keys(options.docSearch).length) {
      const docSearchConfig = options.docSearch;
      if (!docSearchConfig.apiKey && options.apiKey) {
        docSearchConfig.apiKey = options.apiKey;
      }
      if (!docSearchConfig.applicationId && options.applicationId) {
        docSearchConfig.applicationId = options.applicationId;
      }
      addComponentsDir({
        path: resolve(runtimeDir, "components"),
        pathPrefix: false,
        prefix: "",
        level: 999,
        global: true
      });
    }
    if (nuxt?.options?.runtimeConfig?.public?.algolia) {
      nuxt.options.runtimeConfig.public.algolia = defu(nuxt.options.runtimeConfig.algolia, {
        apiKey: options.apiKey,
        applicationId: options.applicationId,
        lite: options.lite,
        instantSearch: options.instantSearch,
        docSearch: options.docSearch,
        recommend: options.recommend,
        globalIndex: options.globalIndex
      });
    } else {
      nuxt.options.publicRuntimeConfig.algolia = defu(nuxt.options.publicRuntimeConfig.algolia, {
        apiKey: options.apiKey,
        applicationId: options.applicationId,
        lite: options.lite,
        instantSearch: options.instantSearch,
        docSearch: options.docSearch,
        recommend: options.recommend,
        globalIndex: options.globalIndex
      });
    }
    if (options.instantSearch) {
      nuxt.options.build.transpile.push("vue-instantsearch/vue3");
      if (typeof options.instantSearch === "object") {
        const { theme } = options.instantSearch;
        if (theme) {
          if (theme in InstantSearchThemes) {
            nuxt.options.css.push(`instantsearch.css/themes/${theme}.css`);
          } else {
            console.error("`[@nuxtjs/algolia]` Invalid theme:", theme);
          }
        }
      }
    }
    addPlugin(resolve(runtimeDir, "plugin"));
    nuxt.hook("autoImports:dirs", (dirs) => {
      dirs.push(resolve(runtimeDir, "composables"));
    });
    if (options?.indexer && Object.keys(options?.indexer).length) {
      const cmsProvider = Object.keys(options.indexer)[0];
      nuxt.options.runtimeConfig.algoliaIndexer = defu(nuxt.options.runtimeConfig.algoliaIndexer, {
        [cmsProvider]: options.indexer[cmsProvider]
      });
      addServerHandler({
        route: "/api/indexer",
        handler: resolve(runtimeDir, `server/api/${cmsProvider}`)
      });
    }
  }
});

export { module as default };
