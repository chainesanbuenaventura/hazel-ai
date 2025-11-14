import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🔍 Candidates API route called at:", new Date().toISOString())

  try {
    // Add CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    }

    const externalApiUrl = "https://lexa-backend-xidw.vercel.app/candidates"
    console.log("🌐 Fetching candidates from external API:", externalApiUrl)

    // Fetch from the external API
    const response = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Lexa-HR-Copilot/1.0",
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log("📡 External API response status:", response.status)

    if (!response.ok) {
      console.error("❌ External API error:", response.status, response.statusText)

      // Try to get error details
      let errorText = ""
      try {
        errorText = await response.text()
        console.error("❌ External API error body:", errorText)
      } catch (e) {
        console.error("❌ Could not read error response")
      }

      return NextResponse.json(
        {
          error: `External API error: ${response.status} ${response.statusText}`,
          details: errorText,
          url: externalApiUrl,
        },
        { status: response.status, headers },
      )
    }

    // Get response as text first to see what we're dealing with
    const responseText = await response.text()
    console.log("📄 Raw response text (first 500 chars):", responseText.substring(0, 500))

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
      console.log("✅ Successfully parsed JSON response")
      console.log("📊 Response type:", typeof data)
      console.log("📊 Is array:", Array.isArray(data))

      if (Array.isArray(data)) {
        console.log("📊 Array length:", data.length)
        if (data.length > 0) {
          console.log("📊 First item keys:", Object.keys(data[0]))
        }
      } else if (data && typeof data === "object") {
        console.log("📊 Object keys:", Object.keys(data))
      }
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError)
      console.log("📄 Full response text:", responseText)

      return NextResponse.json(
        {
          error: "Invalid JSON response from external API",
          responseText: responseText.substring(0, 1000), // First 1000 chars for debugging
          url: externalApiUrl,
        },
        { status: 500, headers },
      )
    }

    // Ensure data is an array
    let candidatesArray = []

    if (Array.isArray(data)) {
      candidatesArray = data
    } else if (data && typeof data === "object") {
      // Check for common response wrapper patterns
      if (Array.isArray(data.candidates)) {
        candidatesArray = data.candidates
        console.log("📊 Found candidates in data.candidates")
      } else if (Array.isArray(data.data)) {
        candidatesArray = data.data
        console.log("📊 Found candidates in data.data")
      } else if (Array.isArray(data.results)) {
        candidatesArray = data.results
        console.log("📊 Found candidates in data.results")
      } else {
        console.log("⚠️ Response is object but no array found, returning empty array")
        candidatesArray = []
      }
    } else {
      console.log("⚠️ Response is not array or object, returning empty array")
      candidatesArray = []
    }

    console.log(`✅ Successfully processed ${candidatesArray.length} candidates from API`)

    return NextResponse.json(candidatesArray, { headers })
  } catch (error) {
    console.error("💥 Candidates API route error:", error)

    // Provide more specific error messages
    let errorMessage = "Unknown error occurred"
    let statusCode = 500

    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Network error: Unable to connect to external API"
      statusCode = 503
    } else if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout: External API took too long to respond"
        statusCode = 504
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        endpoint: "https://lexa-backend-xidw.vercel.app/candidates",
        stack: error instanceof Error ? error.stack : undefined,
      },
      {
        status: statusCode,
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
