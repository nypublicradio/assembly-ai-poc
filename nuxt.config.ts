export default {
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'msapplication-TileColor', content: '#de1e3d' },
        { name: 'theme-color', content: '#de1e3d' }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: 'https://media.wnyc.org/static/img/favicon_wnyc.ico?_=1553611630'
        }
      ]
    }
  },
  modules: [
    '@nuxt/image'
  ],
  image: {
    //dir: 'assets-shared/images',
    wagtail: {
      baseURL: "https://cms.demo.nypr.digital/images/",
      screens: {
        xs: 375,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1280,
        xxl: 1366,
        '2xl': 1920
      },
      presets: {
        avatar: {
          modifiers: {
            format: 'jpg',
            width: 50,
            height: 50
          }
        }
      }
    },
  },
  css: [
    '@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/fonts/fonts.css',
    'primeflex/primeflex.css',
    '@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/wnyc.min.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],
  serverMiddleware: ['~/search/algolia-index'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // be sure to mirror theses imports in the vitest.config.ts
          additionalData: `@import "@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/variables.scss"; @import "@nypublicradio/nypr-design-system-vue3/src/assets/themes/wnyc/_mixins.scss"; @import "~/assets/scss/global.scss";`,
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
  },
  imports: {
    dirs: [
      'composables', // top-level modules
      'composables/*/index.{ts,js,mjs,mts}' // one level directories's index.js,
    ]
  },
  build: {
    transpile: [
      'primevue'
    ]
  },
  runtimeConfig: {
    public: {
      ENV: process.env['ENV'] || 'demo',
      LIVESTREAM_URL: process.env['LIVESTREAM_URL'] || 'https://api.demo.nypr.digital/api/v4/whats_on/',
      stationId: process.env.NUXT_ENV_STATION_ID,
      supabaseUrl: process.env.NUXT_ENV_SUPABASE_URL,
      supabaseKey: process.env.NUXT_ENV_SUPABASE_KEY,
      openAiKey: process.env.NUXT_ENV_OPENAI_KEY,
    }
  }
}