import { defineRailway, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Postgres = postgres("Postgres", { region: "sfo" });
  Postgres.networking = { privateNetworkEndpoint: "postgres" };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const earthyglowApi = service("earthyglow-api", {
    healthcheck: "/api/health",
    healthcheckTimeout: 100,
    replicas: { "sfo": 1 },
    env: { DATABASE_URL: preserve(), FRONTEND_URL: preserve(), NODE_ENV: preserve(), PORT: preserve(), PUBLIC_API_URL: preserve() },
  });

  return project("earthyglow-api", {
    resources: [Postgres, earthyglowApi, postgresVolume],
  });
});
