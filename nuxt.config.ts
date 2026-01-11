import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    'nuxt-i18n-micro'
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'it', iso: 'it-IT', dir: 'ltr' }
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
  vite: {
    plugins: [tailwindcss()]
  },
  css: ['./app/assets/css/main.css'],

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },
})
