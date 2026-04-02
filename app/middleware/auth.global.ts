import type { RouteLocationNormalizedGeneric } from "vue-router";

export default defineNuxtRouteMiddleware(
  (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric,
  ) => {
    const user = useSupabaseUser();
    if ((to.path === "/register" || to.path === "/login") && !user.value) {
      return;
    }
    if ((to.path === "/register" || to.path === "/login") && user.value) {
      return navigateTo("dashboard");
    }
    if (!user.value) {
      return navigateTo("/login");
    }
  },
);
