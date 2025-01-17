import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_app.tsx", [
    route("*", "routes/_app.$.tsx"),
    route("home", "routes/_app.home/route.tsx"),
    route("assignments", "routes/_app.assignments.tsx"),
    route("chores", "routes/_app.chores.tsx"),
    route("people", "routes/_app.people.tsx"),
    route("profile", "routes/_app.profile.tsx"),
    route("rewards", "routes/_app.rewards.tsx"),
    layout("routes/_app._unauthenticated.tsx", [
      index("routes/_app._unauthenticated._index.tsx"),
      route("login", "routes/_app._unauthenticated.login.tsx"),
      route("signup", "routes/_app._unauthenticated.signup.tsx"),
    ]),
  ]),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),
  route("auth/google", "routes/auth.google.tsx"),
  route("chore-chart", "routes/chore-chart.tsx"),
  route("logout", "routes/logout.tsx"),
  route("profile/delete", "routes/profile.delete.tsx"),
] satisfies RouteConfig;
