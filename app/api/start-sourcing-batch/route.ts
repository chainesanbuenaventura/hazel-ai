import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatinput, currentQuery, jd } = body

    if (!jd) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    const webhookUrl =
      "https://charlenesnb.app.n8n.cloud/webhook/f7f02739-cf9e-4069-9887-83f8a8816e34"

    const payload = {
      chatinput: chatinput || "start",
      currentQuery: currentQuery || "none",
      jd: jd,
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Webhook error:", response.status, errorText)
      return NextResponse.json(
        { error: `Webhook returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))
    
    // Extract chat_response and new_query from the response
    // Handle multiple response formats:
    // 1. Direct: { chat_response: "...", new_query: "..." }
    // 2. Array with output: [{ output: { chat_response: "...", new_query: "..." } }]
    // 3. Object with output: { output: { chat_response: "...", new_query: "..." } }
    let chatResponse = ""
    let newQuery = ""
    
    if (Array.isArray(data) && data.length > 0) {
      // Array format: [{ output: {...} }]
      if (data[0]?.output) {
        chatResponse = data[0].output.chat_response || ""
        newQuery = data[0].output.new_query || ""
      } else if (data[0]?.chat_response) {
        // Array format: [{ chat_response: "...", new_query: "..." }]
        chatResponse = data[0].chat_response || ""
        newQuery = data[0].new_query || ""
      }
    } else if (data?.output) {
      // Object with output wrapper: { output: { chat_response: "...", new_query: "..." } }
      chatResponse = data.output.chat_response || ""
      newQuery = data.output.new_query || ""
    } else if (data?.chat_response) {
      // Direct object: { chat_response: "...", new_query: "..." }
      chatResponse = data.chat_response || ""
      newQuery = data.new_query || ""
    }
    
    return NextResponse.json({ 
      success: true, 
      chatResponse,
      newQuery,
      data 
    })
  } catch (error: any) {
    console.error("Error calling webhook:", error)
    return NextResponse.json(
      { error: error.message || "Failed to call webhook" },
      { status: 500 }
    )
  }
}

