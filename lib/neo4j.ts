// lib/neo4j.ts
import neo4j, { Driver } from "neo4j-driver";

let _driver: Driver | null = null;

export function getNeo4jDriver() {
  if (_driver) return _driver;

  const uri = process.env.NEO4J_URI!;
  const user = process.env.NEO4J_USERNAME!;
  const pass = process.env.NEO4J_PASSWORD!;

  _driver = neo4j.driver(uri, neo4j.auth.basic(user, pass), {
    // optional tuning
    disableLosslessIntegers: true, // return JS numbers instead of neo4j int objects
  });
  return _driver;
}

// Next.js will hot-reload in dev; close on process exit in prod
process.on("beforeExit", async () => {
  try { await _driver?.close(); } catch {}
});
