// https://nuxt.com/docs/api/figuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],

  supabase: {
    redirectOptions: {
      // Default to /login
      login: "/login",
      callback: "/",
      // Public routes
      exclude: ["/", "/register"],
    },
    redirect: false,
    types: "./database.types.ts",
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SERVICE_ROLE,
  },

  // Handle auto imports
  imports: {
    dirs: [
      "app/composables/**",
      "composables",
      "node_modules/@tanstack/vue-query",
    ],
  },
});
