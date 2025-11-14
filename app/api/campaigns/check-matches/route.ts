// app/api/campaigns/description-texts/route.ts
import { NextResponse } from "next/server";
import neo4j, { Driver } from "neo4j-driver";

// 🔐 You already added neo4j-driver to package.json.
// If you prefer env vars, replace with process.env.NEO4J_* here.
const NEO4J_URI = "neo4j+s://b01ee78e.databases.neo4j.io";
const NEO4J_USERNAME = "neo4j";
const NEO4J_PASSWORD = "muOwGwkMRs9D5VgVK7fJqgkIanuTKXlr-WFca4g1SMw";

let driver: Driver | null = null;
function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
      { /* optional: encrypted: "ENCRYPTION_ON" */ }
    );
  }
  return driver;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const candidateProfileUrl = searchParams.get("candidateProfileUrl");

    if (!campaignId || !candidateProfileUrl) {
      return NextResponse.json(
        { error: "campaignId and candidateProfileUrl are required" },
        { status: 400 }
      );
    }

    const drv = getDriver();
    const session = drv.session();

    try {
      // Candidate description_text
      const candRes = await session.run(
        `
        MATCH (cand:Candidate {profile_url:$profileUrl})
        RETURN cand.description_text AS candidateDescription
        `,
        { profileUrl: candidateProfileUrl }
      );

      const candidateDescription =
        candRes.records[0]?.get("candidateDescription") ?? "";

      // Job description_text for this campaign
      const jobRes = await session.run(
        `
        MATCH (c:Campaign {id:$campaignId})-[:FOR_CAMPAIGN]->(j:Job)
        RETURN j.description_text AS jobDescription
        `,
        { campaignId }
      );

      const jobDescription = jobRes.records[0]?.get("jobDescription") ?? "";

      // Always return 200 (let client show “Loading / Not available” if empty)
      return NextResponse.json(
        {
          candidateDescription: candidateDescription || "",
          jobDescription: jobDescription || "",
        },
        { status: 200 }
      );
    } finally {
      await session.close();
    }
  } catch (e: any) {
    console.error("description-texts route error:", e);
    return NextResponse.json(
      { error: "Internal error while fetching description texts" },
      { status: 500 }
    );
  }
}

