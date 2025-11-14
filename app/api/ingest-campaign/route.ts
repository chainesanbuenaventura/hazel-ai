import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("📡 Ingest Campaign API called")
    
    const response = await fetch('https://lexa-backend-xidw.vercel.app/ingest_campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Ingest API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Ingest API failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log("✅ Ingest Campaign API success")
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("💥 Ingest Campaign proxy error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to ingest campaign" },
      { status: 500 }
    )
  }
}

