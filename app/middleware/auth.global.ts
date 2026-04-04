import type { RouteLocationNormalizedGeneric } from "vue-router";

export default defineNuxtRouteMiddleware(
  (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric,
  ) => {
    const user = useSupabaseUser();

    if (["/", "/register", "/login"].includes(to.path)) {
      if (
        user.value &&
        (to.path === "/login" || to.path === "/register" || "/")
      ) {
        return navigateTo("/dashboard");
      }
      return;
    }

    if (!user.value) {
      return navigateTo("/login");
    }
  },
);
