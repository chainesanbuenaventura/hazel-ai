import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Here you would typically save the campaign to your database
    // For now, we'll just return a success response

    console.log("Creating new campaign:", body)

    return NextResponse.json({
      success: true,
      message: "Campaign created successfully",
      campaign_id: `campaign-${Date.now()}`,
    })
  } catch (error) {
    console.error("Error creating campaign:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // This endpoint could be used to fetch campaigns from your own database
  // For now, we'll redirect to the proxy endpoint
  return NextResponse.redirect("/api/campaigns-proxy")
}
