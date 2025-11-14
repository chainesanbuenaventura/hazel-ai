import { NextRequest, NextResponse } from 'next/server'

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

    console.log(`🔄 Proxying candidate matching request for campaign: ${campaignId}`)
    const externalUrl = `https://lexa-backend-xidw.vercel.app/match_candidates?campaignId=${campaignId}`
    console.log(`🌐 Calling external API: ${externalUrl}`)

    // Call the external API
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`❌ External API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Successfully proxied candidate matching for campaign: ${campaignId}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in match-external API:', error)
    return NextResponse.json(
      { error: 'Failed to match candidates' },
      { status: 500 }
    )
  }
}
