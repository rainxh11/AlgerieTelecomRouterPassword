import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.jsx"),
  route("api/generate", "routes/api.generate.js"),
  route("health", "routes/health.js"),
] satisfies RouteConfig;
