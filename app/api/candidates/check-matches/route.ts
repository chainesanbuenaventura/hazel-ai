import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🔍 Check matches API route called at:", new Date().toISOString())

  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }

    console.log("🎯 Checking if HAS_MATCH relationships exist for campaign:", campaignId)

    // Neo4j Query to check if HAS_MATCH relationships exist for this campaign
    const neo4jQuery = `
      MATCH (c:Campaign {id: $campaignId})-[:HAS_MATCH]->(s:Candidate)
      RETURN s
    `

    console.log(`🔍 Executing Neo4j query: ${neo4jQuery}`)
    console.log(`🔍 With campaignId: ${campaignId}`)

    // Call Neo4j API
    const neo4jResponse = await fetch('https://lexa-backend-xidw.vercel.app/neo4j/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: neo4jQuery,
        parameters: { campaignId }
      })
    })

    if (!neo4jResponse.ok) {
      console.error(`❌ Neo4j API error: ${neo4jResponse.status} ${neo4jResponse.statusText}`)
      return NextResponse.json(
        { error: `Neo4j API error: ${neo4jResponse.status}` },
        { status: neo4jResponse.status }
      )
    }

    const neo4jData = await neo4jResponse.json()
    console.log(`📊 Neo4j response:`, neo4jData)

    const hasMatches = neo4jData.results && neo4jData.results.length > 0
    const matchCount = hasMatches ? neo4jData.results.length : 0
    const candidates = hasMatches ? neo4jData.results.map((row: any, index: number) => ({
      id: row.s?.identifier || `candidate-${index + 1}`,
      name: row.s?.name || 'Unknown',
      email: row.s?.email || '',
      profile_url: row.s?.profile_url,
      phone: row.s?.phone,
      status: row.s?.profile_status || 'Active'
    })) : []

    console.log(`📊 Campaign ${campaignId} has ${matchCount} HAS_MATCH relationships`)

    const result = {
      campaignId,
      hasMatches,
      matchCount,
      candidates,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("💥 Check matches API route error:", error)

    return NextResponse.json(
      {
        error: "Failed to check for matches",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
