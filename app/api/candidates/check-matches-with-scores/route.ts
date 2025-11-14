import { NextRequest, NextResponse } from 'next/server'

interface HasMatchRelationship {
  availabilityBonus: number
  educationScore: number
  experienceScore: number
  languageScore: number
  locationScore: number
  rank: number
  salaryAlignmentBonus: number
  semanticScore: number
  seniorityScore: number
  skillsScore: number
  totalScore: number
  updatedAt: string
}

interface MatchedCandidateWithScores {
  id: string
  name: string
  email: string
  profile_url?: string
  phone?: string
  availability?: string
  experience?: Array<{ title?: string; company?: string; years?: string }>
  skills?: string[]
  seniority?: string
  status?: string
  matchScores: HasMatchRelationship
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Querying Neo4j for HAS_MATCH relationships for campaign: ${campaignId}`)

    // Neo4j query to get candidates with HAS_MATCH relationships and related data
    const neo4jQuery = `
      MATCH (c:Campaign {id: $campaignId})-[:HAS_MATCH]->(s:Candidate)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(skill:Skill)
      OPTIONAL MATCH (s)-[:WORKED_AT]->(exp:Experience)
      OPTIONAL MATCH (s)-[:ATTENDED]->(uni:University)
      WITH s, 
           collect(DISTINCT skill.name) as skills,
           collect(DISTINCT {title: exp.title, company: exp.company, years: exp.years}) as experience,
           collect(DISTINCT uni.name) as education
      RETURN 
        s.identifier as id,
        s.name as name,
        s.email as email,
        s.profile_url as profile_url,
        s.phone as phone,
        s.profile_status as status,
        s.summary as summary,
        skills as skills,
        experience as experience,
        education as education
      ORDER BY s.name
    `

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

    if (!neo4jData.results || neo4jData.results.length === 0) {
      console.log(`📭 No HAS_MATCH relationships found for campaign: ${campaignId}`)
      return NextResponse.json({
        hasMatches: false,
        candidates: []
      })
    }

    // Transform Neo4j results to our interface
    const candidates: MatchedCandidateWithScores[] = neo4jData.results.map((row: any, index: number) => ({
      id: row.id || `candidate-${index + 1}`,
      name: row.name || 'Unknown',
      email: row.email || '',
      profile_url: row.profile_url,
      phone: row.phone,
      availability: 'Available', // Default since not in schema
      experience: row.experience || [],
      skills: row.skills || [],
      seniority: 'Not specified', // Default since not in schema
      status: row.status || 'Active',
      matchScores: {
        availabilityBonus: 0,
        educationScore: 0,
        experienceScore: 0,
        languageScore: 0,
        locationScore: 0,
        rank: index + 1,
        salaryAlignmentBonus: 0,
        semanticScore: 0,
        seniorityScore: 0,
        skillsScore: 0,
        totalScore: 0,
        updatedAt: new Date().toISOString()
      }
    }))

    console.log(`✅ Found ${candidates.length} matched candidates for campaign: ${campaignId}`)

    return NextResponse.json({
      hasMatches: true,
      candidates: candidates
    })

  } catch (error) {
    console.error('❌ Error querying Neo4j for matches with scores:', error)
    return NextResponse.json(
      { error: 'Failed to query Neo4j for matches' },
      { status: 500 }
    )
  }
}
