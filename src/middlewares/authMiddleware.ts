import useAuth from "@/composables/useAuth";
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";

export default function auth(_to : RouteLocationNormalized, _from : RouteLocationNormalized, next : NavigationGuardNext) {
  const { user } = useAuth();

  if (!user.value) {
    // If not authenticated, redirect to login page
    next({ name: "login" });
  } else {
    next(); // If authenticated, proceed with the route
  }
}
