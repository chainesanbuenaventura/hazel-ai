import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("📡 Extract Job JSON API called with:", { rawJobJson: body.rawJobJson?.substring(0, 100) + "..." })
    
    const response = await fetch('http://lexa-backend-xidw.vercel.app/extract_job_json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawJobJson: body.rawJobJson
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Extract API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Extract API failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log("✅ Extract API success")
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("💥 Extract Job JSON proxy error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to extract job JSON" },
      { status: 500 }
    )
  }
}

