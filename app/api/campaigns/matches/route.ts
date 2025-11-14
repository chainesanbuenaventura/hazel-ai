// app/api/campaigns/matches/route.ts
import { NextResponse } from "next/server";

// Make sure this runs on Node.js (not edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Hard-coded Neo4j credentials (as requested) ───────────────────────────────
const NEO4J_URI = "neo4j+s://b01ee78e.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "muOwGwkMRs9D5VgVK7fJqgkIanuTKXlr-WFca4g1SMw";

// Lazy singleton (so the module isn't required at build time)
let _driver: any | null = null;

async function getDriver(): Promise<any> {
  if (_driver) return _driver;

  let neo4jMod: any;
  try {
    // Lazy import so Next build doesn't fail if package isn't installed yet
    neo4jMod = await import("neo4j-driver");
  } catch (e) {
    // Clear, friendly error instead of a build crash
    throw new Error(
      "neo4j-driver is not installed. Run: npm i neo4j-driver (or yarn add neo4j-driver / pnpm add neo4j-driver)"
    );
  }

  const driver = neo4jMod.driver(
    NEO4J_URI,
    neo4jMod.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
  );
  _driver = driver;
  return driver;
}

function toStringSafe(v: any): string | null {
  if (v == null) return null;
  try {
    return typeof v === "string" ? v : v.toString?.() ?? String(v);
  } catch {
    return String(v);
  }
}

function candidateId(props: Record<string, any>): string {
  return (
    props.profile_url_key ||
    props.identifier ||
    props.profile_url ||
    props.email ||
    props.name ||
    ""
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "Missing campaignId" },
        { status: 400 }
      );
    }

    const driver = await getDriver();
    const session = driver.session();

    const cypher = `
      MATCH (c:Campaign {id: $campaignId})
      OPTIONAL MATCH (c)-[r:HAS_MATCH]->(s:Candidate)
      WITH r, s
      WHERE r IS NOT NULL AND s IS NOT NULL
      RETURN s, r
      ORDER BY r.rank ASC, r.totalScore DESC
    `;

    const result = await session.run(cypher, { campaignId });
    await session.close();

    const hasMatches = result.records.length > 0;

    const candidates = result.records.map((rec: any) => {
      const sNode = rec.get("s");
      const rRel = rec.get("r");
      const s = sNode?.properties ?? {};
      const r = rRel?.properties ?? {};

      return {
        // Candidate basics
        id: candidateId(s),
        name: s.name ?? "",
        email: s.email ?? s.email_norm ?? null,
        profile_url: s.profile_url ?? s.profile_url_norm ?? s.identifier ?? null,
        profile_pic_url: s.profile_pic_url ?? null,
        phone: s.phone ?? null,
        status: s.profile_status ?? null,
        country: s.country ?? null,

        // Match scores from HAS_MATCH relationship
        matchScores: {
          totalScore: Number(r.totalScore ?? 0),
          skillsScore: Number(r.skillsScore ?? 0),
          languageScore: Number(r.languageScore ?? 0),
          seniorityScore: Number(r.seniorityScore ?? 0),
          experienceScore: Number(r.experienceScore ?? 0),
          educationScore: Number(r.educationScore ?? 0),
          locationScore: Number(r.locationScore ?? 0),
          semanticScore: Number(r.semanticScore ?? 0),
          availabilityBonus: Number(r.availabilityBonus ?? 0),
          salaryAlignmentBonus: Number(r.salaryAlignmentBonus ?? 0),
          rank: Number(r.rank ?? 0),
          updatedAt: toStringSafe(r.updatedAt) ?? new Date().toISOString(),
        },
      };
    });

    return NextResponse.json(
      { success: true, hasMatches, candidates },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
