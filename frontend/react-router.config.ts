import type { Config } from "@react-router/dev/config";

const PRERENDER_INDEX_ROUTE = true;

export default {
  appDirectory: "app",
  buildDirectory: "build",
  ssr: true,
  prerender: PRERENDER_INDEX_ROUTE ? ["/"] : [],
} satisfies Config;
