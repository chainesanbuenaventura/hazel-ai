import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🔍 Matched candidates API route called at:", new Date().toISOString())

  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }

    console.log("🎯 Checking matched candidates for campaign:", campaignId)

    // Neo4j Query to check if HAS_MATCH relationships exist for this campaign
    // MATCH (c:Campaign {campaign_id: $campaignId})-[:HAS_MATCH]->(candidate)
    // RETURN count(candidate) as matchCount, collect(candidate) as candidates
    
    // Mock implementation - In real implementation, connect to Neo4j and run the query above
    const mockCampaignId = campaignId
    
    // Simulate checking if this specific campaign has matches
    // For demo purposes, let's say only specific campaigns have matches
    // Must match the logic in check-matches API
    const campaignIdLastDigit = parseInt(campaignId.slice(-1)) || 0
    const hasMatches = campaignIdLastDigit === 8 || campaignIdLastDigit === 9
    
    if (!hasMatches) {
      console.log("📭 No matches found for campaign:", campaignId)
      return NextResponse.json([], {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      })
    }

    console.log("📬 Matches found for campaign:", campaignId)
    
    // Mock data structure representing Neo4j results for matched candidates
    const mockMatchedCandidates = [
      {
        email: "sarah.wilson@example.com",
        name: "Sarah Wilson",
        phone: "+1 (555) 234-5678",
        availability: "2 weeks",
        status: "active",
        profile_status: "active",
        profile_pic_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        profile_url: "https://linkedin.com/in/sarahwilson",
        seniority: "senior",
        skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
        experience: [
          {
            title: "Senior Full Stack Developer",
            company: "TechCorp Inc",
            years: "2021-2024",
          },
          {
            title: "Frontend Developer",
            company: "StartupXYZ",
            years: "2019-2021",
          },
        ],
        match_score: 0.92,
      },
      {
        email: "david.chen@example.com",
        name: "David Chen",
        phone: "+1 (555) 345-6789",
        availability: "1 month",
        status: "active",
        profile_status: "active",
        profile_pic_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        profile_url: "https://linkedin.com/in/davidchen",
        seniority: "mid",
        skills: ["JavaScript", "React", "Python", "Docker", "PostgreSQL"],
        experience: [
          {
            title: "Full Stack Developer",
            company: "DevSolutions",
            years: "2020-2024",
          },
        ],
        match_score: 0.87,
      },
      {
        email: "maria.rodriguez@example.com",
        name: "Maria Rodriguez",
        phone: "+1 (555) 456-7890",
        availability: "Immediately",
        status: "active",
        profile_status: "active",
        profile_pic_url: null,
        profile_url: "https://linkedin.com/in/mariarodriguez",
        seniority: "senior",
        skills: ["Vue.js", "React", "Node.js", "MongoDB", "Kubernetes"],
        experience: [
          {
            title: "Lead Frontend Developer",
            company: "WebTech Solutions",
            years: "2019-2024",
          },
        ],
        match_score: 0.83,
      },
    ]

    // Simulate delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log(`✅ Returning ${mockMatchedCandidates.length} matched candidates`)

    return NextResponse.json(mockMatchedCandidates, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("💥 Matched candidates API route error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch matched candidates",
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
