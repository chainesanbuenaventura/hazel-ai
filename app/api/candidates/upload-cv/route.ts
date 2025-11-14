import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔍 CV Upload API route called at:", new Date().toISOString())

  try {
    // Get form data
    const formData = await request.formData()
    const cvFile = formData.get("cv") as File
    const candidateName = formData.get("candidateName") as string
    const candidateEmail = formData.get("candidateEmail") as string
    const candidatePhone = formData.get("candidatePhone") as string

    console.log("📋 Form data received:", {
      fileName: cvFile?.name,
      fileSize: cvFile?.size,
      candidateName: candidateName || "Not provided",
      candidateEmail: candidateEmail || "Not provided",
      candidatePhone: candidatePhone || "Not provided",
    })

    if (!cvFile) {
      console.error("❌ No CV file provided")
      return NextResponse.json({ success: false, error: "No CV file provided" }, { status: 400 })
    }

    // Validate file type
    if (cvFile.type !== "application/pdf") {
      console.error("❌ Invalid file type:", cvFile.type)
      return NextResponse.json({ success: false, error: "Only PDF files are allowed" }, { status: 400 })
    }

    // Create FormData for the webhook
    const webhookFormData = new FormData()
    webhookFormData.append("file", cvFile, cvFile.name)
    webhookFormData.append("candidateName", candidateName || "Unknown Candidate")
    webhookFormData.append("candidateEmail", candidateEmail || "")
    webhookFormData.append("candidatePhone", candidatePhone || "")

    console.log("🚀 Sending CV to n8n webhook...")

    // Send to n8n webhook
    const webhookUrl = "  cloud/webhook/480a1ef7-de09-45d9-8913-7a53470f1617"
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      body: webhookFormData,
      // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
    })

    console.log("📡 Webhook response status:", webhookResponse.status)

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error("❌ Webhook error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`,
          details: errorText,
        },
        { status: webhookResponse.status },
      )
    }

    // Get webhook response
    const webhookResult = await webhookResponse.text()
    console.log("✅ Webhook response:", webhookResult)

    // Try to parse as JSON, fallback to text
    let parsedResult
    try {
      parsedResult = JSON.parse(webhookResult)
    } catch {
      parsedResult = { message: webhookResult }
    }

    return NextResponse.json({
      success: true,
      message: "CV uploaded successfully to Google Drive",
      googleDriveResult: parsedResult,
      candidateInfo: {
        name: candidateName || "Unknown Candidate",
        email: candidateEmail || "",
        phone: candidatePhone || "",
        fileName: cvFile.name,
        fileSize: cvFile.size,
      },
    })
  } catch (error) {
    console.error("💥 CV Upload error:", error)

    let errorMessage = "Failed to upload CV"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
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
